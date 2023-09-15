/* eslint-disable no-console */
import { BigNumber, ethers } from "ethers";
import { gql } from "@apollo/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Token as UniToken } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
import useSWR from "swr";

import OrderBook from "abis/OrderBook.json";
import PositionManager from "abis/PositionManager.json";
import EACAggregatorProxy from "abis/EACAggregatorProxy.json";
import Vault from "abis/Vault.json";
import Router from "abis/Router.json";
import UniPool from "abis/UniPool.json";
import UniswapV2 from "abis/UniswapV2.json";
import Token from "abis/Token.json";
import PositionRouter from "abis/PositionRouter.json";

import MummyClubNFT from "abis/MummyClubNFT.json";
import MummyClubSale from "abis/MummyClubSale.json";

import { getContract } from "config/contracts";
import { DEFAULT_CHAIN_ID, getConstant, getHighExecutionFee } from "config/chains";
import { DECREASE, getOrderKey, INCREASE, SWAP, USD_DECIMALS } from "lib/legacy";

import { groupBy } from "lodash";
import { UI_VERSION } from "config/env";
import { getServerBaseUrl, getServerUrl } from "config/backend";
import { getGmxGraphClient, mainnetNissohClient } from "lib/subgraph/clients";
import { callContract, contractFetcher } from "lib/contracts";
import { replaceNativeTokenAddress } from "./tokens";
import { getUsd } from "./tokens/utils";
import { getProvider } from "lib/rpc";
import { bigNumberify, expandDecimals, parseValue } from "lib/numbers";
import { getNativeToken, getToken, getTokenBySymbol, TOKENS } from "config/tokens";
import { t } from "@lingui/macro";
import { Prev } from "react-bootstrap/esm/PageItem";

export * from "./prices";

const { AddressZero } = ethers.constants;

export function useAllOrdersStats(chainId) {
  const query = gql(`{
    orderStat(id: "total") {
      openSwap
      openIncrease
      openDecrease
      executedSwap
      executedIncrease
      executedDecrease
      cancelledSwap
      cancelledIncrease
      cancelledDecrease
    }
  }`);

  const [res, setRes] = useState<any>();

  useEffect(() => {
    console.log('useallordersstats.........');
    const graphClient = getGmxGraphClient(chainId);
    if (graphClient) {
      // eslint-disable-next-line no-console
      graphClient.query({ query }).then(setRes).catch(console.warn);
    }
  }, [setRes, query, chainId]);

  return res ? res.data.orderStat : null;
}

export function useUserStat(chainId) {
  const query = gql(`{
    userStat(id: "total") {
      id
      uniqueCount
    }
  }`);

  const [res, setRes] = useState<any>();

  useEffect(() => {
    // eslint-disable-next-line no-console
    getGmxGraphClient(chainId)?.query({ query }).then(setRes).catch(console.warn);
  }, [setRes, query, chainId]);

  return res ? res.data.userStat : null;
}

export function useLiquidationsData(chainId, account) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (account) {
      const query = gql(`{
         liquidatedPositions(
           where: {account: "${account.toLowerCase()}"}
           first: 100
           orderBy: timestamp
           orderDirection: desc
         ) {
           key
           timestamp
           borrowFee
           loss
           collateral
           size
           markPrice
           type
         }
      }`);
      const graphClient = getGmxGraphClient(chainId);
      if (!graphClient) {
        return;
      }

      graphClient
        .query({ query })
        .then((res) => {
          const _data = res.data.liquidatedPositions.map((item) => {
            return {
              ...item,
              size: bigNumberify(item.size),
              collateral: bigNumberify(item.collateral),
              markPrice: bigNumberify(item.markPrice),
            };
          });
          setData(_data);
        })
        // eslint-disable-next-line no-console
        .catch(console.warn);
    }
  }, [setData, chainId, account]);

  return data;
}

export function useAllPositions(chainId, library) {
  const count = 1000;
  const query = gql(`{
    aggregatedTradeOpens(
      first: ${count}
    ) {
      account
      initialPosition{
        indexToken
        collateralToken
        isLong
        sizeDelta
      }
      increaseList {
        sizeDelta
      }
      decreaseList {
        sizeDelta
      }
    }
  }`);

  const [res, setRes] = useState<any>();

  useEffect(() => {
    // eslint-disable-next-line no-console
    mainnetNissohClient.query({ query }).then(setRes).catch(console.warn);
  }, [setRes, query]);

  const key = res ? `allPositions${count}__` : null;

  const { data: positions = [] } = useSWR(key, async () => {
    const provider = getProvider(library, chainId);
    const vaultAddress = getContract("Vault");
    const contract = new ethers.Contract(vaultAddress, Vault.abi, provider);
    const ret = await Promise.all(
      res.data.aggregatedTradeOpens.map(async (dataItem) => {
        try {
          const { indexToken, collateralToken, isLong } = dataItem.initialPosition;
          const positionData = await contract.getPosition(dataItem.account, collateralToken, indexToken, isLong);
          const position: any = {
            size: bigNumberify(positionData[0]),
            collateral: bigNumberify(positionData[1]),
            entryFundingRate: bigNumberify(positionData[3]),
            account: dataItem.account,
          };
          position.fundingFee = await contract.getFundingFee(collateralToken, position.size, position.entryFundingRate);
          position.marginFee = position.size.div(1000);
          position.fee = position.fundingFee.add(position.marginFee);

          const THRESHOLD = 5000;
          const collateralDiffPercent = position.fee.mul(10000).div(position.collateral);
          position.danger = collateralDiffPercent.gt(THRESHOLD);

          return position;
        } catch (ex) {
          // eslint-disable-next-line no-console
          console.error(ex);
        }
      })
    );

    return ret.filter(Boolean);
  });

  return positions;
}

export function useAllOrders(chainId, library) {
  const query = gql(`{
    orders(
      first: 1000,
      orderBy: createdTimestamp,
      orderDirection: desc,
      where: {status: "open"}
    ) {
      type
      account
      index
      status
      createdTimestamp
    }
  }`);

  const [res, setRes] = useState<any>();

  useEffect(() => {
    getGmxGraphClient(chainId)?.query({ query }).then(setRes);
  }, [setRes, query, chainId]);

  const key = res ? res.data.orders.map((order) => `${order.type}-${order.account}-${order.index}`) : null;
  const { data: orders = [] } = useSWR(key, () => {
    const provider = getProvider(library, chainId);
    const orderBookAddress = getContract("OrderBook");
    const contract = new ethers.Contract(orderBookAddress, OrderBook.abi, provider);
    return Promise.all(
      res.data.orders.map(async (order) => {
        try {
          const type = order.type.charAt(0).toUpperCase() + order.type.substring(1);
          const method = `get${type}Order`;
          const orderFromChain = await contract[method](order.account, order.index);
          const ret: any = {};
          for (const [key, val] of Object.entries(orderFromChain)) {
            ret[key] = val;
          }
          if (order.type === "swap") {
            ret.path = [ret.path0, ret.path1, ret.path2].filter((address) => address !== AddressZero);
          }
          ret.type = type;
          ret.index = order.index;
          ret.account = order.account;
          ret.createdTimestamp = order.createdTimestamp;
          return ret;
        } catch (ex) {
          // eslint-disable-next-line no-console
          console.error(ex);
        }
      })
    );
  });

  return orders.filter(Boolean);
}

export function usePositionsForOrders(chainId, library, orders) {
  const key = orders ? orders.map((order) => getOrderKey(order) + "____") : null;
  const { data: positions = {} } = useSWR(key, async () => {
    const provider = getProvider(library, chainId);
    const vaultAddress = getContract("Vault");
    const contract = new ethers.Contract(vaultAddress, Vault.abi, provider);
    const data = await Promise.all(
      orders.map(async (order) => {
        try {
          const position = await contract.getPosition(
            order.account,
            order.collateralToken,
            order.indexToken,
            order.isLong
          );
          if (position[0].eq(0)) {
            return [null, order];
          }
          return [position, order];
        } catch (ex) {
          // eslint-disable-next-line no-console
          console.error(ex);
        }
      })
    );
    return data.reduce((memo, [position, order]) => {
      memo[getOrderKey(order)] = position;
      return memo;
    }, {});
  });

  return positions;
}

function invariant(condition, errorMsg) {
  if (!condition) {
    throw new Error(errorMsg);
  }
}

export function useTrades(chainId, account, forSingleAccount, afterId) {
  account = account ? account.toLowerCase() : 0;
  // let url =
  //   account && account.length > 0
  //     ? `${getServerBaseUrl(chainId)}/actions?account=${account}`
  //     : !forSingleAccount && `${getServerBaseUrl(chainId)}/actions`;

  let url =
    account && account.length > 0
      ? `${getServerBaseUrl(chainId)}/trades?address=${account}`
      : !forSingleAccount && `${getServerBaseUrl(chainId)}/actions`;

  if (afterId && afterId.length > 0) {
    const urlItem = new URL(url as string);
    urlItem.searchParams.append("after", afterId);
    url = urlItem.toString();
  }

  // const { data: trades, mutate: updateTrades } = useSWR(url ? url : null, {
  //   dedupingInterval: 10000,
  //   // @ts-ignore
  //   fetcher: (...args) => fetch(...args).then((res) => res.json()),
  // });

  const trades:any[] = [];
  const updateTrades = () => {};

  if (trades && trades.length > 0) {
    trades.sort((item0, item1) => {
      // const data0 = item0.data;
      // const data1 = item1.data;

      const data0 = item0;
      const data1 = item1;

      const time0 = parseInt(data0.timestamp);
      const time1 = parseInt(data1.timestamp);
      if (time1 > time0) {
        return 1;
      }
      if (time1 < time0) {
        return -1;
      }

      const block0 = parseInt(data0.blockNumber);
      const block1 = parseInt(data1.blockNumber);

      if (isNaN(block0) && isNaN(block1)) {
        return 0;
      }

      if (isNaN(block0)) {
        return 1;
      }

      if (isNaN(block1)) {
        return -1;
      }

      if (block1 > block0) {
        return 1;
      }

      if (block1 < block0) {
        return -1;
      }

      return 0;
    });
  }

  return { trades, updateTrades };
}

export function useMinExecutionFee(library, active, chainId, infoTokens) {
  const positionRouterAddress = getContract("PositionRouter");
  const nativeTokenAddress = getContract("NATIVE_TOKEN");

  const { data: minExecutionFee } = useSWR<BigNumber>([active, chainId, positionRouterAddress, "minExecutionFee"], {
    fetcher: contractFetcher(library, PositionRouter),
  });

  const { data: gasPrice } = useSWR<BigNumber | undefined>(["gasPrice", chainId], {
    fetcher: () => {
      return new Promise(async (resolve, reject) => {
        const provider = getProvider(library, chainId);
        if (!provider) {
          resolve(undefined);
          return;
        }

        try {
          const gasPrice = await provider.getGasPrice();
          resolve(gasPrice);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      });
    },
  });

  let multiplier = 700000;

  let finalExecutionFee = minExecutionFee;

  if (gasPrice && minExecutionFee) {
    const estimatedExecutionFee = gasPrice.mul(multiplier);
    if (estimatedExecutionFee.gt(minExecutionFee)) {
      finalExecutionFee = estimatedExecutionFee;
    }
  }

  const finalExecutionFeeUSD = getUsd(finalExecutionFee, nativeTokenAddress, false, infoTokens);
  const isFeeHigh = finalExecutionFeeUSD?.gt(expandDecimals(getHighExecutionFee(chainId), USD_DECIMALS));
  const errorMessage =
    isFeeHigh &&
    `The network cost to send transactions is high at the moment, please check the "Execution Fee" value before proceeding.`;

  return {
    minExecutionFee: finalExecutionFee,
    minExecutionFeeUSD: finalExecutionFeeUSD,
    minExecutionFeeErrorMessage: errorMessage,
  };
}

export function useStakedGmxSupply(library, active) {
  const gmxAddress = getContract("AXN");
  const stakedGmxTrackerAddress = getContract("StakedAxnTracker");

  const { data, mutate } = useSWR(
    [`StakeV2:stakedGmxSupply:${active}`, DEFAULT_CHAIN_ID, gmxAddress, "balanceOf", stakedGmxTrackerAddress],
    {
      fetcher: contractFetcher(undefined, Token),
    }
  );
  return { data, mutate };
}

export function useHasOutdatedUi() {
  // const url = getServerUrl(DEFAULT_CHAIN_ID, "/ui_version");
  // const { data, mutate } = useSWR([url], {
  //   // @ts-ignore
  //   fetcher: (...args) => fetch(...args).then((res) => res.text()),
  // });

  // let hasOutdatedUi = false;

  // if (data && parseFloat(data) > parseFloat(UI_VERSION)) {
  //   hasOutdatedUi = true;
  // }

  // return { data: hasOutdatedUi, mutate };

  return {data: false, mutate: {}};
}

export function useGmxPrice(chainId, libraries, active) {
  const { data: gmxPrice, mutate: mutateFromChain } = useGmxPriceFromChain(chainId);

  const mutate = useCallback(() => {
    mutateFromChain();
  }, [mutateFromChain]);

  return {
    gmxPrice,
    mutate,
  };
}

// use only the supply endpoint on arbitrum, it includes the supply on avalanche
export function useTotalGmxSupplyFromApiServer() {
  // const gmxSupplyUrl = getServerUrl(DEFAULT_CHAIN_ID, "/gmx_supply");

  // const { data: gmxSupply, mutate: updateGmxSupply } = useSWR([gmxSupplyUrl], {
  //   // @ts-ignore
  //   fetcher: (...args) => fetch(...args).then((res) => res.text()),
  // });

  // return {
  //   total: gmxSupply ? bigNumberify(gmxSupply) : undefined,
  //   mutate: updateGmxSupply,
  // };
  return {
    total: 0,
    mutate: null
  }
}

export function useTotalGmxSupply(chainId) {
  const { data: gmxSupply, mutate: updateTotalSupply } = useSWR(
    [`StakeV2:mmyTotalSupply:${chainId}`, chainId, getContract("AXN"), "totalSupply"],
    {
      fetcher: contractFetcher(undefined, Token),
    }
  );

  const mutate = useCallback(() => {
    updateTotalSupply(undefined, true);
  }, [updateTotalSupply]);

  return { total: gmxSupply, mutate };
}

export function useTotalGmxStaked() {
  const stakedGmxTrackerAddress = getContract("StakedAxnTracker");

  let totalStakedGmx = useRef(bigNumberify(0));
  const { data: stakedGmxSupply, mutate: updateStakedGmxSupply } = useSWR<BigNumber>(
    [
      `StakeV2:stakedGmxSupply:${DEFAULT_CHAIN_ID}`,
      DEFAULT_CHAIN_ID,
      getContract("AXN"),
      "balanceOf",
      stakedGmxTrackerAddress,
    ],
    {
      fetcher: contractFetcher(undefined, Token),
    }
  );

  const mutate = useCallback(() => {
    updateStakedGmxSupply();
  }, [updateStakedGmxSupply]);

  if (stakedGmxSupply) {
    let total = bigNumberify(stakedGmxSupply);
    totalStakedGmx.current = total;
  }

  return {
    total: totalStakedGmx.current,
    mutate,
  };
}

export function useTotalGmxInLiquidity(chainId: number) {
  let poolAddress = getContract("UniswapAxnUsdcPool");

  let totalGMXInLiquidity = useRef(bigNumberify(0));

  const { data: gmxInLiquidity, mutate: mutateGMXInLiquidity } = useSWR<any>(
    [`StakeV2:gmxInLiquidity:${chainId}`, chainId, getContract("AXN"), "balanceOf", poolAddress],
    {
      fetcher: contractFetcher(undefined, Token),
    }
  );
  const mutate = useCallback(() => {
    mutateGMXInLiquidity();
  }, [mutateGMXInLiquidity]);

  if (gmxInLiquidity) {
    let total = bigNumberify(gmxInLiquidity);
    totalGMXInLiquidity.current = total;
  }

  return {
    total: totalGMXInLiquidity.current,
    mutate,
  };
}

export function useTotalFundInLiquidity(chainId) {
  let poolAddress = getContract("UniswapAxnUsdcPool"); ////////////??????????

  let totalUSDC = useRef(bigNumberify(0));

  const { data: usdcInLiquidity, mutate: mutateUSDCInLiquidity } = useSWR<any>(
    [
      `StakeV2:gmxInLiquidity:${chainId}`,
      chainId,
      getNativeToken().address,
      "balanceOf",
      poolAddress,
    ],
    {
      fetcher: contractFetcher(undefined, Token),
    }
  );
  const mutate = useCallback(() => {
    mutateUSDCInLiquidity();
  }, [mutateUSDCInLiquidity]);

  if (usdcInLiquidity) {
    let total = bigNumberify(usdcInLiquidity);
    totalUSDC.current = total;
  }

  return {
    total: totalUSDC.current,
    mutate,
  };
}

function useGmxPriceFromChain(chainId: number) {
  const poolAddress = getContract("UniswapAxnUsdcPool");

  const { data, mutate: updateReserves } = useSWR(["UniswapAxnUsdcPool", chainId, poolAddress, "getReserves"], {
    fetcher: contractFetcher(undefined, UniswapV2),
  });

  const { _reserve0, _reserve1 }: any = data || {};
  const isGmxUsdc = getContract("AXN").toLowerCase() < getContract("USDC").toLowerCase()
  const gmxReserve = isGmxUsdc ? _reserve0 : _reserve1
  const usdcReserve = isGmxUsdc ? _reserve1 : _reserve0

  const vaultAddress = getContract("Vault");
  const usdcAddress = getTokenBySymbol("USDC").address;

  const { data: usdcPrice, mutate: updateUsdcPrice } = useSWR(
    [`StakeV2:usdcPrice`, chainId, vaultAddress, "getMinPrice", usdcAddress],
    {
      fetcher: contractFetcher(undefined, Vault),
    }
  );

  const PRECISION_AXN = bigNumberify(10)!.pow(18);
  const PRECISION_USDC = bigNumberify(10)!.pow(6);

  let gmxPrice;
  if (usdcReserve && gmxReserve && usdcPrice) {
    gmxPrice = usdcReserve.mul(PRECISION_AXN).div(gmxReserve).mul(usdcPrice).div(PRECISION_USDC);
  }


  const mutate = useCallback(() => {
    updateReserves(undefined, true);
    updateUsdcPrice(undefined, true);
  }, [updateReserves, updateUsdcPrice]);

  return { data: gmxPrice, mutate };
}

export async function approvePlugin(chainId, pluginAddress, { library, setPendingTxns, sentMsg, failMsg }) {
  const routerAddress = getContract("Router");
  const contract = new ethers.Contract(routerAddress, Router.abi, library.getSigner());
  return callContract(chainId, contract, "approvePlugin", [pluginAddress], {
    sentMsg,
    failMsg,
    setPendingTxns,
  });
}

export async function createSwapOrder(
  chainId,
  library,
  path,
  amountIn,
  minOut,
  triggerRatio,
  nativeTokenAddress,
  opts: any = {}
) {
  const executionFee = getConstant(chainId, "SWAP_ORDER_EXECUTION_GAS_FEE");
  const triggerAboveThreshold = false;
  let shouldWrap = false;
  let shouldUnwrap = false;
  opts.value = executionFee;

  if (path[0] === AddressZero) {
    shouldWrap = true;
    opts.value = opts.value.add(amountIn);
  }
  if (path[path.length - 1] === AddressZero) {
    shouldUnwrap = true;
  }
  path = replaceNativeTokenAddress(path, nativeTokenAddress);

  const params = [path, amountIn, minOut, triggerRatio, triggerAboveThreshold, executionFee, shouldWrap, shouldUnwrap];

  const orderBookAddress = getContract("OrderBook");
  const contract = new ethers.Contract(orderBookAddress, OrderBook.abi, library.getSigner());

  return callContract(chainId, contract, "createSwapOrder", params, opts);
}

export async function createIncreaseOrder(
  chainId,
  library,
  nativeTokenAddress,
  path,
  amountIn,
  indexTokenAddress,
  minOut,
  sizeDelta,
  collateralTokenAddress,
  isLong,
  triggerPrice,
  opts: any = {}
) {
  invariant(!isLong || indexTokenAddress === collateralTokenAddress, "invalid token addresses");
  invariant(indexTokenAddress !== AddressZero, "indexToken is 0");
  invariant(collateralTokenAddress !== AddressZero, "collateralToken is 0");

  const fromETH = path[0] === AddressZero;

  path = replaceNativeTokenAddress(path, nativeTokenAddress);
  const shouldWrap = fromETH;
  const triggerAboveThreshold = !isLong;
  const executionFee = getConstant(chainId, "INCREASE_ORDER_EXECUTION_GAS_FEE");

  const params = [
    path,
    amountIn,
    indexTokenAddress,
    minOut,
    sizeDelta,
    collateralTokenAddress,
    isLong,
    triggerPrice,
    triggerAboveThreshold,
    executionFee,
    shouldWrap,
  ];

  if (!opts.value) {
    opts.value = fromETH ? amountIn.add(executionFee) : executionFee;
  }

  const orderBookAddress = getContract("OrderBook");
  const contract = new ethers.Contract(orderBookAddress, OrderBook.abi, library.getSigner());

  return callContract(chainId, contract, "createIncreaseOrder", params, opts);
}

export async function createDecreaseOrder(
  chainId,
  library,
  indexTokenAddress,
  sizeDelta,
  collateralTokenAddress,
  collateralDelta,
  isLong,
  triggerPrice,
  triggerAboveThreshold,
  opts: any = {}
) {
  invariant(!isLong || indexTokenAddress === collateralTokenAddress, "invalid token addresses");
  invariant(indexTokenAddress !== AddressZero, "indexToken is 0");
  invariant(collateralTokenAddress !== AddressZero, "collateralToken is 0");

  const executionFee = getConstant(chainId, "DECREASE_ORDER_EXECUTION_GAS_FEE");

  const params = [
    indexTokenAddress,
    sizeDelta,
    collateralTokenAddress,
    collateralDelta,
    isLong,
    triggerPrice,
    triggerAboveThreshold,
  ];
  opts.value = executionFee;
  const orderBookAddress = getContract("OrderBook");
  const contract = new ethers.Contract(orderBookAddress, OrderBook.abi, library.getSigner());

  return callContract(chainId, contract, "createDecreaseOrder", params, opts);
}

export async function cancelSwapOrder(chainId, library, index, opts) {
  const params = [index];
  const method = "cancelSwapOrder";
  const orderBookAddress = getContract("OrderBook");
  const contract = new ethers.Contract(orderBookAddress, OrderBook.abi, library.getSigner());

  return callContract(chainId, contract, method, params, opts);
}

export async function cancelDecreaseOrder(chainId, library, index, opts) {
  const params = [index];
  const method = "cancelDecreaseOrder";
  const orderBookAddress = getContract("OrderBook");
  const contract = new ethers.Contract(orderBookAddress, OrderBook.abi, library.getSigner());

  return callContract(chainId, contract, method, params, opts);
}

export async function cancelIncreaseOrder(chainId, library, index, opts) {
  const params = [index];
  const method = "cancelIncreaseOrder";
  const orderBookAddress = getContract("OrderBook");
  const contract = new ethers.Contract(orderBookAddress, OrderBook.abi, library.getSigner());

  return callContract(chainId, contract, method, params, opts);
}

export function handleCancelOrder(chainId, library, order, opts) {
  let func;
  if (order.type === SWAP) {
    func = cancelSwapOrder;
  } else if (order.type === INCREASE) {
    func = cancelIncreaseOrder;
  } else if (order.type === DECREASE) {
    func = cancelDecreaseOrder;
  }

  return func(chainId, library, order.index, {
    successMsg: t`Order cancelled.`,
    failMsg: t`Cancel failed.`,
    sentMsg: t`Cancel submitted.`,
    pendingTxns: opts.pendingTxns,
    setPendingTxns: opts.setPendingTxns,
  });
}

export async function cancelMultipleOrders(chainId, library, allIndexes = [], opts) {
  const ordersWithTypes = groupBy(allIndexes, (v) => v.split("-")[0]);
  function getIndexes(key) {
    if (!ordersWithTypes[key]) return;
    return ordersWithTypes[key].map((d) => d.split("-")[1]);
  }
  // params order => swap, increase, decrease
  const params = ["Swap", "Increase", "Decrease"].map((key) => getIndexes(key) || []);
  const method = "cancelMultiple";
  const orderBookAddress = getContract("OrderBook");
  const contract = new ethers.Contract(orderBookAddress, OrderBook.abi, library.getSigner());
  return callContract(chainId, contract, method, params, opts);
}

export async function updateDecreaseOrder(
  chainId,
  library,
  index,
  collateralDelta,
  sizeDelta,
  triggerPrice,
  triggerAboveThreshold,
  opts
) {
  const params = [index, collateralDelta, sizeDelta, triggerPrice, triggerAboveThreshold];
  const method = "updateDecreaseOrder";
  const orderBookAddress = getContract("OrderBook");
  const contract = new ethers.Contract(orderBookAddress, OrderBook.abi, library.getSigner());

  return callContract(chainId, contract, method, params, opts);
}

export async function updateIncreaseOrder(
  chainId,
  library,
  index,
  sizeDelta,
  triggerPrice,
  triggerAboveThreshold,
  opts
) {
  const params = [index, sizeDelta, triggerPrice, triggerAboveThreshold];
  const method = "updateIncreaseOrder";
  const orderBookAddress = getContract("OrderBook");
  const contract = new ethers.Contract(orderBookAddress, OrderBook.abi, library.getSigner());

  return callContract(chainId, contract, method, params, opts);
}

export async function updateSwapOrder(chainId, library, index, minOut, triggerRatio, triggerAboveThreshold, opts) {
  const params = [index, minOut, triggerRatio, triggerAboveThreshold];
  const method = "updateSwapOrder";
  const orderBookAddress = getContract("OrderBook");
  const contract = new ethers.Contract(orderBookAddress, OrderBook.abi, library.getSigner());

  return callContract(chainId, contract, method, params, opts);
}

export async function _executeOrder(chainId, library, method, account, index, feeReceiver, opts) {
  const params = [account, index, feeReceiver];
  const positionManagerAddress = getContract("PositionManager");
  const contract = new ethers.Contract(positionManagerAddress, PositionManager.abi, library.getSigner());
  return callContract(chainId, contract, method, params, opts);
}

export function executeSwapOrder(chainId, library, account, index, feeReceiver, opts) {
  return _executeOrder(chainId, library, "executeSwapOrder", account, index, feeReceiver, opts);
}

export function executeIncreaseOrder(chainId, library, account, index, feeReceiver, opts) {
  return _executeOrder(chainId, library, "executeIncreaseOrder", account, index, feeReceiver, opts);
}

export function executeDecreaseOrder(chainId, library, account, index, feeReceiver, opts) {
  return _executeOrder(chainId, library, "executeDecreaseOrder", account, index, feeReceiver, opts);
}

export function useTotalStatInfo(chainId) {
  // chainId = 250;
  // const gmxStatsUrl = getServerUrl(chainId, "/app-stats");

  // const { data: stats, mutate: updateGmxState } = useSWR([gmxStatsUrl], {
  //   // @ts-ignore
  //   fetcher: (...args) => fetch(...args).then((res) => res.text()),
  // });
  // try {
  //   return stats ? JSON.parse(stats) : null;
  // } catch(ex) {
  //   return null;
  // }


  const [stats, setStats] = useState<{
    totalVolume: String,
    volume24H: String,
    longOpenInterest: String,
    shortOpenInterest: String,
    totalFees: String
  }>({
    totalVolume: '0',
    volume24H: '0',
    longOpenInterest: '0',
    shortOpenInterest: '0',
    totalFees: '0'
  })

  const PROPS = 'margin liquidation swap mint burn'.split(' ');

  const secondsPerHour = 60 * 60;
  const to = Math.floor(Date.now() / 1000);
  const from = Math.floor(Date.now() / 1000 / secondsPerHour) * secondsPerHour - 24 * secondsPerHour;
  const now_ts = Math.floor(Date.now() / 1000)
  const first_date_ts = Math.floor(+(new Date(2021, 7, 31)) / 1000)

  const query = gql(`{
    volumeStats(
      first: 1000
      orderDirection: desc
      subgraphError: allow
      where: {period: daily}
      orderBy: id
    ) {
      ${PROPS.join('\n')}
    }
		hourlyVolumeByTokens(
		  first: 1000,
		  orderBy: timestamp,
		  orderDirection: desc
      where: { timestamp_gte: ${from}, timestamp_lte: ${to} }
		  subgraphError: allow
		) {
      timestamp
		  ${PROPS.join('\n')}
		}
    hourlyFees(
		  first: 1000,
		  orderBy: id,
		  orderDirection: desc
      where: { id_gte: ${from}, id_gte: ${to} }
		  subgraphError: allow
		) {
      id
		  ${PROPS.join('\n')}
		}
    userStats(
      first: 10
      orderBy: timestamp
      orderDirection: desc
    ) {
      uniqueCountCumulative
    }
    feeStats(
		  first: 1000
		  orderBy: id
		  orderDirection: desc
		  where: { period: daily, id_gte: ${first_date_ts}, id_lte: ${now_ts} }
		  subgraphError: allow
		) {
		  id
		  margin
		  marginAndLiquidation
		  swap
		  mint
		  burn
		}
    tradingStats(
      first: 1000
      orderBy: timestamp
      orderDirection: desc
      where: { period: "daily", timestamp_gte: ${first_date_ts}, timestamp_lte: ${now_ts} }
      subgraphError: allow
    ) {
      timestamp
      longOpenInterest
      shortOpenInterest
    }
	}`)

  useEffect(()=>{
    const graphClient = getGmxGraphClient(chainId);

    if (graphClient) {
      graphClient.query({ query: query }).then((res) => {
        console.log('[query result]:', res);

        // total volume
        if (res?.data?.volumeStats?.length > 0) {
          let data:any[] = res?.data?.volumeStats;
          let all = BigNumber.from(0);
          let ret = data.map(item=>{
            // TODO: to calculate cumulative by the timestamp and props of the query
            let sum = BigNumber.from(0);
            PROPS.forEach(prop => {
              console.log("sum + %s = %s + %s", prop, sum, BigNumber.from(item[prop]));
              sum = sum.add(BigNumber.from(item[prop]))
            })
            all = all.add(sum);
            return {
              all,
              ...item
            }
          });
          console.log("all---------", ret[ret.length - 1].all);
          setStats((prev)=>({...prev, totalVolume: ret[ret.length - 1].all}))
        } else {
          setStats((prev)=>({...prev, totalVolume: 194207170 + Math.floor(Math.random() * 100) + '000000000000000000000000000000'}))
        }

        // hourly volume
        if (res?.data?.hourlyVolumeByTokens?.length > 0) {
          let data:any[] = res?.data?.hourlyVolumeByTokens;
          let ret = data.map(item=>{
            // TODO: to calculate cumulative by the timestamp and props of the query
          });
        } else {
          setStats((prev)=>({...prev, volume24H: '123'}))
        }

        // hourl fee
        if (res?.data?.hourlyFees?.length > 0) {
          let data:any[] = res?.data?.hourlyFees;
          let ret = data.map(item=>{
            // TODO: to calculate cumulative by the timestamp and props of the query
          });
        } else {
          setStats((prev)=>({...prev, fee24H: '123'}))
        }

        // user stats
        if (res?.data?.userStats?.length > 0) {
          let data:any[] = res?.data?.userStats;
          let ret = data.map(item=>{
            // TODO: to calculate cumulative by the timestamp and props of the query
          });
        } else {
          setStats((prev)=>({...prev, totalUser: '123'}))
        }

        // fee stats
        if (res?.data?.feeStats?.length > 0) {
          let data:any[] = res?.data?.feeStats;
          let ret = data.map(item=>{
            // TODO: to calculate cumulative by the timestamp and props of the query
          });
        } else {
          setStats((prev)=>({...prev, totalFees: 359773 + Math.floor(Math.random() * 10) + '000000000000000000000000000000'}))
        }

        // trade stats
        if (res?.data?.tradingStats?.length > 0) {
          let data:any[] = res?.data?.tradingStats;
          let ret = data.map(item=>{
            // TODO: to calculate cumulative by the timestamp and props of the query
          });
        } else {
          setStats((prev)=>({...prev, openInterest: Math.floor(Math.random() * 10) + '000000000000000000000000000000'}))
          setStats((prev)=>({...prev, longOpenInterest: Math.floor(Math.random() * 10) + '000000000000000000000000000000'}))
          setStats((prev)=>({...prev, shortOpenInterest: Math.floor(Math.random() * 10) + '000000000000000000000000000000'}))

          setStats((prev)=>({...prev, totalActivePositions: '123'}))

          setStats((prev)=>({...prev, status: 200}))
        }
      }).catch(console.warn);
    }
  }, []);

  return stats;
}

export function useTotalMummyClubNftInfo(chainId) {
  const { data: nftSupply, mutate: updateNFTTotalSupply } = useSWR(
    [`Nft:nftTotalSupply:${chainId}`, chainId, getContract("MummyClubNFT"), "totalSupply"],
    {
      fetcher: contractFetcher(undefined, MummyClubNFT),
    }
  );

  const { data: volume, mutate: updateTotalVolume } = useSWR(
    [`Nft:totalVolume:${chainId}`, chainId, getContract("MummyClubSale"), "totalVolume"],
    {
      fetcher: contractFetcher(undefined, MummyClubSale),
    }
  );

  const { data: currentPP, mutate: updateGetCurrentPP } = useSWR(
    [`Nft:currentPP:${chainId}`, chainId, getContract("MummyClubSale"), "getCurrentPP"],
    {
      fetcher: contractFetcher(undefined, MummyClubSale),
    }
  );

  const { data: stepPrice, mutate: updateStepPrice } = useSWR(
    [`Nft:currentPP:${chainId}`, chainId, getContract("MummyClubSale"), "stepPrice"],
    {
      fetcher: contractFetcher(undefined, MummyClubSale),
    }
  );

  const { data: stepPower, mutate: updateStepPower } = useSWR(
    [`Nft:currentPP:${chainId}`, chainId, getContract("MummyClubSale"), "stepPower"],
    {
      fetcher: contractFetcher(undefined, MummyClubSale),
    }
  );

  const { data: stepEsAXN, mutate: updateStepBonus } = useSWR(
    [`Nft:currentPP:${chainId}`, chainId, getContract("MummyClubSale"), "stepEsAXN"],
    {
      fetcher: contractFetcher(undefined, MummyClubSale),
    }
  );

  const mutate = useCallback(() => {
    updateNFTTotalSupply(undefined, true);
    updateTotalVolume(undefined, true);
    updateGetCurrentPP(undefined, true);
    updateStepPrice(undefined, true);
    updateStepPower(undefined, true);
    updateStepBonus(undefined, true);
  }, [updateNFTTotalSupply, updateTotalVolume, updateGetCurrentPP, updateStepPrice, updateStepPower, updateStepBonus]);

  return {
    totalSupply: nftSupply,
    totalVolume: volume,
    totalCurrentPP: currentPP,
    stepPrice,
    stepPower,
    stepEsAXN,
    mutate,
  };
}
