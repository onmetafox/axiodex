import { useCallback, useEffect, useMemo, useState } from "react";
import { Trans } from "@lingui/macro";
import Button from "components/Button/Button";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import Tab from "../Tab/Tab";
import "./BridgeCard.css"
import { getIcon } from "config/icons";
import { getContract } from "config/contracts";
import BuyInputSection from "../BuyInputSection/BuyInputSection";
import TokenSelector from "../Exchange/TokenSelector";
import { getWhitelistedTokens } from "config/tokens";
import ImgIcon2 from "components/IconComponent/ImgIcon2";
import { useChainId } from "lib/chains";
import { PLACEHOLDER_ACCOUNT, getBalanceAndSupplyData } from "lib/legacy";

import ReaderV2 from "abis/ReaderV2.json";
import { contractFetcher, callContract } from "lib/contracts";
import { formatAmount, formatHash } from "lib/numbers";
import { BigNumber, ethers } from "ethers";

import l1BridgeAbi from "abis/l1standardbridge.json";
import l2BridgeAbi from "abis/l2standardbridge.json";
import l2ToL1MessagePasserAbi from "abis/l2ToL1MessagePasser.json";
import l2OutputOracleAbi from "abis/l2OutputOracle.json";
import optimismPortalAbi from "abis/optimismPortal.json";
import tokenAbi from "abis/ERC20.json";

import { getProvider } from "lib/rpc";
import { getWalletConnectConnector, switchNetwork } from "lib/wallets";
import { ETH_TESTNET, BRIDGE_ETH_CHAIN, getChainName, DEFAULT_CHAIN_ID, getRpcUrl } from "config/chains";
import { InjectedConnector } from "@web3-react/injected-connector";
import { defaultAbiCoder, keccak256 } from "ethers/lib/utils";
import { HashZero } from '@ethersproject/constants';
import { addAbortSignal } from "stream";

const readerAddress = getContract("Reader");
const axnAddress = getContract("AXN");
const esAxnAddress = getContract("EsAXN");
const l1StandardBridge = getContract("L1StandardBridge");
const l2StandardBridge = getContract("L2StandardBridge");
const l2ToL1MessagePasser = getContract("L2ToL1MessagePasser");
const l2OutputOracle = getContract("L2OutputOracle");
const optimismPortal = getContract("OptimismPortal");

const ethIcon = getIcon("common", "eth");
const baseIcon = getIcon("common", "network");
const gmxIcon = getIcon("common", "axn");

const miniGasAmount = '100000';
const defaultGasAmount = '8000000'
const emptyData = '0x';

export const sleep = async (seconds) => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

export const ETH_PROVIDER = new ethers.providers.JsonRpcProvider(
  "https://eth-goerli.g.alchemy.com/v2/aAuXa6S-4mkFfe7goRmfSo_hIm2yY28h",
  // "https://ethereum-goerli.publicnode.com",
  BRIDGE_ETH_CHAIN
)

export const BASE_PROVIDER = new ethers.providers.JsonRpcProvider(
  "https://base-goerli.g.alchemy.com/v2/lCCk2aX_3kgkBdTSNQ0i_Rxwusew-kdN",
  DEFAULT_CHAIN_ID
)

const l2ExplorerApi = 'https://base-goerli.blockscout.com/api';

export default function BridgeCard({ setPendingTxns, connectWallet }) {
  // const { active, library, account } = useWeb3React();
  const { active, library, account, activate } = useWeb3React();
  const walletTokens = [axnAddress, esAxnAddress];

  const { chainId } = useChainId();
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [isDeposit,  setIsDeposit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bridgeChainId, setBridgeChainId] = useState(chainId);
  const [withdrawList, setWithdrawList] = useState([]);

  const tabLabel = isDeposit ? 'Deposit' : 'Withdraw';



  const hashWithdrawal = (withdrawalMessage) => {
    const types = [
      'uint256',
      'address',
      'address',
      'uint256',
      'uint256',
      'bytes',
    ];
    const encoded = defaultAbiCoder.encode(types, [
      withdrawalMessage.nonce,
      withdrawalMessage.sender,
      withdrawalMessage.target,
      withdrawalMessage.value,
      withdrawalMessage.gasLimit,
      withdrawalMessage.data,
    ]);
    return keccak256(encoded);
  };

  const getTokenContract = (signer, address) => {
    const tokenContract = new ethers.Contract(address, tokenAbi, signer);
    return tokenContract;
  };

  const getWithdrawalMessage = async (messageContract, withdrawal, isToken) => {
    let messageLog = withdrawal.logs.find((log) => {
      if (log.address === l2ToL1MessagePasser) {
        const parsed = messageContract.interface.parseLog(log);
        // console.log('parsed', parsed);
        return parsed.name === 'MessagePassed';
      }
      return false;
    });
    // console.log('messageLog', messageLog);

    if (!messageLog) {
      messageLog = withdrawal.logs[0];
    }
    const parsedLog = messageContract.interface.parseLog(messageLog);

    const withdrawalMessage = {
      nonce: parsedLog.args.nonce,
      sender: parsedLog.args.sender,
      target: parsedLog.args.target,
      value: parsedLog.args.value,
      gasLimit: parsedLog.args.gasLimit,
      data: parsedLog.args.data,
    };
    // console.log('withdrawalMessage', withdrawalMessage);
    return withdrawalMessage;
  };

  const fetchWithdrawals = async (data) => {
    try {
      // Getting contracts
      const oracleContract = new ethers.Contract(
        l2OutputOracle,
        l2OutputOracleAbi,
        ETH_PROVIDER
      )

      const portalContract = new ethers.Contract(
        optimismPortal,
        optimismPortalAbi,
        ETH_PROVIDER.getSigner(account)
      )

      const messageContract = new ethers.Contract(
        l2ToL1MessagePasser,
        l2ToL1MessagePasserAbi,
        library?.getSigner(account)
      );

      const l2StandardBridgeContract = new ethers.Contract(
        l2StandardBridge,
        l2BridgeAbi,
        library?.getSigner(account)
      )
      if(data && data.result) {
        const withdrawals = [];
        for(let i = 0 ; i<data.result.length; i ++ ){
          const tx = data.result[i];
          // console.log(i, tx);
          if(tx.isError === '1') continue;
          if(tx.to === l2ToL1MessagePasser && tx.value !== '0') withdrawals.push(tx);
          if(tx.to === optimismPortal && tx.value !== '0') withdrawals.push(tx);
          if(tx.to === l2StandardBridge) {
            const functionName = l2StandardBridgeContract.interface.getFunction(tx.input.slice(0,10)).name;
            if(functionName === 'withdraw') {
              const decodedWithdrawData = l2StandardBridgeContract.interface.decodeFunctionData(
                tx.input.slice(0,10),
                tx.input
              )
              tx.value = decodedWithdrawData[1].toString();
              const tokenDetails = getTokenContract(getSigner(library, account), decodedWithdrawData[0]);
              tx.symbol = await tokenDetails.symbol();

              withdrawals.push(tx);
            }
          }
        }
        // console.log('raw transactions', withdrawals);
        // setWithdrawList(withdrawals)

        const latestBlockNumber = await oracleContract.latestBlockNumber();
        const finalizationPeriod = await oracleContract.FINALIZATION_PERIOD_SECONDS();
        for(let i = 0 ; i < withdrawals.length ; i ++) {
          const withdrawal = withdrawals[i];
          const receipt = await BASE_PROVIDER.getTransactionReceipt(withdrawal.hash);
          if(!receipt) {
            withdrawal.isFinalized = false;
            withdrawal.isProven = false;
            withdrawal.isReadyToProve = false;
            withdrawal.isReadyToFinalize = false;
            continue;
          }
          const wm = await getWithdrawalMessage(messageContract, receipt);
          const hash = hashWithdrawal(wm);
          const isFinalized = await portalContract.finalizedWithdrawals(hash);
          withdrawal.isFinalized = isFinalized;

          const rawProof = await portalContract.provenWithdrawals(hash);
          withdrawal.rawProof = rawProof;
          const isProven = rawProof[0] !== HashZero;
          withdrawal.isReadyToFinalize =
            Math.floor(Date.now()) > (rawProof[1] + finalizationPeriod) &&
            !isFinalized &&
            isProven;
          withdrawal.isProven = isProven;
          withdrawal.isReadyToProve =
            latestBlockNumber >= receipt.blockNumber && !isFinalized && !isProven;
        }
        // console.log('withdrawals', withdrawals);

        const sorted = withdrawals.sort((a, b) => {
          return a.timeStamp > b.timeStamp;
        });

        setWithdrawList(sorted);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // const { data: walletBalances } = useSWR(
  //   [
  //     `StakeV2:walletBalances:${active}`,
  //     chainId,
  //     readerAddress,
  //     "getTokenBalancesWithSupplies",
  //     account || PLACEHOLDER_ACCOUNT,
  //   ],
  //   {
  //     fetcher: contractFetcher(library, ReaderV2, [walletTokens]),
  //   }
  // );

  // Fetching transaction
  const params = {
    address: account,
    action: 'txlist',
    module: 'account',
    filterby: 'from',
    startblock: '0'
  }
  const searchParams = new URLSearchParams(params).toString();
  const url = new URL(l2ExplorerApi);
  url.search = searchParams;
  const { data } = useSWR([url.toString()], {
    refreshInterval: 3000,
    dedupingInterval: 10000,
    fetcher: (...args) => fetch(...args).then(async (res) => await res.json()),
  });

  // const withdrawals = [];

  const getBalance = useCallback(async () => {
    // const _balance = isDeposit ? await ETH_PROVIDER.getBalance(account): (active ? await library.getBalance(account) : await BASE_PROVIDER.getBalance(account));
    const _balance = (await BASE_PROVIDER.getBalance(account));
    const _ethBalance = await ETH_PROVIDER.getBalance(account);
    setBalance(_balance);
    setEthBalance(_ethBalance)
  }, [account])

  useEffect(()=>{
    if(account) {
      getBalance();
    }
  }, [tabLabel, account, chainId, getBalance])
  useEffect(()=>{
    fetchWithdrawals(data);
  }, [data])

  useEffect(() => {
    processWithdrawal();
  }, [withdrawList])

  const whitelistedTokens = getWhitelistedTokens();
  const nativeTokenAddress = getContract("NATIVE_TOKEN");

  const getButtonText = () => {
    if(isSubmitting) {
      return <Trans>Bridging...</Trans>
    } else if (amount === 0) {
      return <Trans>Enter an amount</Trans>
    } else {
      return <Trans>Bridge</Trans>
    }
  }
  function getSigner(library, account) {
    return library.getSigner(account);
  }

  function getProviderOrSigner(
    library,
    account,
  ) {
      return account ? getSigner(library, account) : library;
  }

  const onInitiateWithdrawal = async () => {
    try {
      setIsSubmitting(true);
      const messageContract = new ethers.Contract(
        l2ToL1MessagePasser,
        l2ToL1MessagePasserAbi,
        library.getSigner(account)
      );

      const nonce = await messageContract.messageNonce();
      const ethAmount = ethers.utils.parseUnits(amount);
      callContract(chainId, messageContract, 'initiateWithdrawal', [account, miniGasAmount, emptyData], {
        value: ethAmount,
        gasLimit: defaultGasAmount,
        sendMsg: 'Bridge submitted',
        successMsg: `${ethAmount}Eth bridged from ${getChainName(DEFAULT_CHAIN_ID)} to ${getChainName(BRIDGE_ETH_CHAIN)}`,
        failMsg: `Bridge failed`,
        setPendingTxns
      })
      .then((res) => {
        // console.log(res)
      })
      .catch((err) => console.error(err))
      .finally(() => setIsSubmitting(false));
    } catch (e) {
      console.error(e);
    }
  }

  const onProveWithdrawal = async (hash) => {
    try {
      // Getting contracts
      const oracleContract = new ethers.Contract(
        l2OutputOracle,
        l2OutputOracleAbi,
        ETH_PROVIDER.getSigner(account)
      )

      const portalContract = new ethers.Contract(
        optimismPortal,
        optimismPortalAbi,
        ETH_PROVIDER.getSigner(account)
      )

      const messageContract = new ethers.Contract(
        l2ToL1MessagePasser,
        l2ToL1MessagePasserAbi,
        BASE_PROVIDER.getSigner(account)
      );

      const withdrawal = await BASE_PROVIDER.getTransactionReceipt(hash);
      // console.log('withdrawal receipt:', withdrawal?.blockNumber, withdrawal);
      if(!withdrawal) return;

      const l2OutputIdx = await oracleContract.getL2OutputIndexAfter(
        withdrawal.blockNumber,
      )
      // console.log('l2OutputIndx', l2OutputIdx);

      const l2Output = await oracleContract.getL2Output(l2OutputIdx);
      // console.log('l2Output', l2Output);

      let messageLog = withdrawal.logs.find((log) => {
        if(log.address === l2ToL1MessagePasser) {
          const parsed = messageContract.interface.parseLog(log);
          return parsed.name === 'MessagePassed';
        }
        return false;
      });
      // console.log('messageLog:', messageLog);

      if(!messageLog) {
        messageLog = withdrawal.logs[0];
      }
      const parsedLog = messageContract.interface.parseLog(messageLog);

      const withdrawalMessage = {
        nonce: parsedLog.args.nonce,
        sender: parsedLog.args.sender,
        target: parsedLog.args.target,
        value: parsedLog.args.value,
        gasLimit: parsedLog.args.gasLimit,
        data: parsedLog.args.data,
      };
      // console.log('withdrawalMessage', withdrawalMessage);

      const types = [
        'uint256',
        'address',
        'address',
        'uint256',
        'uint256',
        'bytes',
      ];

      const encoded = defaultAbiCoder.encode(types, [
        withdrawalMessage.nonce,
        withdrawalMessage.sender,
        withdrawalMessage.target,
        withdrawalMessage.value,
        withdrawalMessage.gasLimit,
        withdrawalMessage.data,
      ]);

      const hashedWithdrawal = keccak256(encoded);

      // console.log('hasedWithdrawal', hashedWithdrawal);

      const messageSlot = keccak256(
        defaultAbiCoder.encode(
          ['bytes32', 'uint256'],
          [hashedWithdrawal, HashZero]
        )
      )

      // console.log('messageSlot', messageSlot);

      const l2BlockNumber = "0x" + ethers.BigNumber.from(l2Output[2]).toBigInt().toString(16);

      const proof = await BASE_PROVIDER.send('eth_getProof', [
        l2ToL1MessagePasser,
        [messageSlot],
        l2BlockNumber
      ]);

      // console.log('proof', proof);

      const block = await BASE_PROVIDER.send('eth_getBlockByNumber', [
        l2BlockNumber,
        false,
      ]);
      // console.log('block', block);
      if(!block) return;
      const outputProof = {
        version: HashZero,
        stateRoot: block.stateRoot,
        messagePasserStorageRoot: proof.storageHash,
        latestBlockhash: block.hash,
      };
      // console.log('outputProof', outputProof);

      // const proving = await portalContract.proveWithdrawalTransaction(
      //   withdrawalMessage,
      //   l2OutputIdx,
      //   outputProof,
      //   proof.storageProof
      // )

      // console.log('proving', proving);
      // const result = await proving.wait();
      // return;
      callContract(chainId, portalContract, 'proveWithdrawalTransaction', [withdrawalMessage, l2OutputIdx, outputProof, proof.storageProof[0].proof], {
        // value: defaultGasAmount,
        gasLimit: defaultGasAmount,
        sendMsg: 'Proving submitted',
        successMsg: `Proved successfully`,
        failMsg: `Proving failed`,
        setPendingTxns
      })
      .then(async (res) => {
        console.log(res)
        await sleep(10)
      })
      .catch(async (err) => {
        console.error(err)
        await sleep(10)
      })
      .finally(() => setIsSubmitting(false));

    } catch (e) {
      console.error(e);
    }
  }

  const onFinalizeWithdrawal = async (hash) => {
    // Getting contracts
    const oracleContract = new ethers.Contract(
      l2OutputOracle,
      l2OutputOracleAbi,
      ETH_PROVIDER.getSigner(account)
    )

    const portalContract = new ethers.Contract(
      optimismPortal,
      optimismPortalAbi,
      ETH_PROVIDER.getSigner(account)
    )

    const messageContract = new ethers.Contract(
      l2ToL1MessagePasser,
      l2ToL1MessagePasserAbi,
      library?.getSigner(account)
    );

    const l2StandardBridgeContract = new ethers.Contract(
      l2StandardBridge,
      l2BridgeAbi,
      library?.getSigner(account)
    )
    const withdrawal = await library.getTransactionReceipt(hash);
    // console.log('withdrawal receipt', withdrawal.blockNumber, withdrawal);

    const msg = await getWithdrawalMessage(messageContract, withdrawal)
    // console.log('msg', msg);

  }

  const onNetworkSelect = useCallback(
    (value) => {
      if (value === chainId) {
        return;
      }
      if(!active) {
        setTimeout(() => {
          switchNetwork(value, active);
        }, 500)
      } else {
        setBridgeChainId(value);
        switchNetwork(value, active);
        activate();
      }
    },
    [chainId, active]
  );

  const onBridge = async () => {
    if(isDeposit) {
      try {
        setIsSubmitting(true);
        const bridgeContract = new ethers.Contract(
          l1StandardBridge,
          l1BridgeAbi,
          // ETH_PROVIDER.getSigner(account)
          library.getSigner(account)
        );

        const sender = await bridgeContract.l2TokenBridge();

        const ethAmount = ethers.utils.parseEther(amount);

        callContract(chainId, bridgeContract, 'bridgeETH', [miniGasAmount, '0x'], {
          value: ethAmount,
          gasLimit: defaultGasAmount,
          sentMsg: `Bridge submitted.`,
          successMsg: `Success`,
          failMsg: `Bridge failed.`,
          setPendingTxns,
        })
          .then(async (res) => {
            console.log(res)
            await sleep(10)
          })
          .catch(async (err) => {
            console.error(err);
            await sleep(10)
          })
          .finally(() => {
            setIsSubmitting(false);
          });

      } catch(e) {
        setIsSubmitting(false);
        console.error(e)
      }
    }
    else {
      try {
        onInitiateWithdrawal();
      } catch(e) {
        setIsSubmitting(false);
        console.error(e);
      }
    }
  }

  const onBridgeOptionChange = (opt) => {
    if(opt === 'Deposit')
      setIsDeposit(true)
    else setIsDeposit(false)
  };

  const onChangeAmount = (e) => {
    setAmount(e.target.value)
  }

  const processWithdrawal = async () => {
    withdrawList.forEach(async (item) => {
      if(item.isReadyToProve) {
        await onProveWithdrawal(item.hash);
      }
      if(item.isReadyToFinalize) {
        // await onFinalizeWithdrawal(item.hash);
      }
    })
  }

  return (
    <div className="BridgeCard">
      <div className="row">
        <div className="col-lg-12 col-sm-12 col-md-12 ">
          <div className="row padding-1r">
            <div className="col-lg-8 col-sm-12 col-md-12 m-auto">
              <div className="Exchange-swap-section strategy-container colored border-0">
                <Tab
                  options={['Deposit', 'Withdraw']}
                  option={tabLabel}
                  onChange={onBridgeOptionChange}
                />
                {!isDeposit && (
                  <div>
                    <div className="bridge-chain-row">
                      <ImgIcon2 icon = {baseIcon} title = "From" value="Base"/>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" ariaHidden="true" className="arrow-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path></svg>
                      <ImgIcon2 icon = {ethIcon} title = "To" value="Ethereum"/>
                    </div>
                    <div className="bridge-amount-row">
                      <div className="input-row">
                        <div className="input-label-row">
                          <label className="input-label">
                            <Trans>I want to transfer</Trans>
                          </label>
                          <label className="input-label">
                            <Trans>Balance: <span className="value">{formatAmount(balance, 18, 3, true)}ETH</span></Trans>
                          </label>
                        </div>
                        <div className="input-label-row pb-3">
                          <input
                            type="text"
                            value={amount}
                            onChange={onChangeAmount}
                            className="text-input"
                            placeholder= "Enter Address"
                          />
                        </div>
                        <div className="input-label-row">
                          <label className="input-label">
                            You will receive: <span className="value">ETH</span>
                          </label>
                        </div>
                        <div className="input-label-row">
                          <label className="input-label">
                            Bridge fee: <span className="value">ETH</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="row padding-1r">
                      {!active ? (
                        <button className="App-cta Exchange-swap-button" onClick={() => connectWallet()}>
                          <Trans>Connect Wallet</Trans>
                        </button>
                      ) : (
                        chainId !== DEFAULT_CHAIN_ID ? (
                          <button className="App-cta Exchange-swap-button" onClick={() => onNetworkSelect(DEFAULT_CHAIN_ID)}>
                          <Trans>Switch to {getChainName(DEFAULT_CHAIN_ID)}</Trans>
                        </button>
                        ) : (
                          <div style={{ display: "flex", justifyContent: "around", alignItems: "center" }}>
                          <button className="default-btn" onClick={()=>onBridge()}  disabled={isSubmitting || amount === 0}>
                            {getButtonText()}
                          </button>
                        </div>
                        )
                      )}
                    </div>
                  </div>
                )}
                {isDeposit && (
                  <div>
                    <div className="bridge-chain-row">
                      <ImgIcon2 icon = {ethIcon} title = "From" value="Ethereum"/>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" ariaHidden="true" className="arrow-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path></svg>
                      <ImgIcon2 icon = {baseIcon} title = "To" value="Base"/>
                    </div>
                    <div className="bridge-amount-row">
                      <div className="input-row">
                        <div className="input-label-row">
                          <label className="input-label">
                            <Trans>I want to transfer</Trans>
                          </label>
                          <label className="input-label">
                            <Trans>Balance: <span className="value">{formatAmount(ethBalance, 18, 3, true)}ETH</span></Trans>
                          </label>
                        </div>
                        <div className="input-label-row pb-3">
                          <input
                            type="text"
                            value={amount}
                            onChange={onChangeAmount}
                            className="text-input"
                            placeholder= "Enter Address"
                          />
                        </div>
                        <div className="input-label-row">
                          <label className="input-label">
                            You will receive: <span className="value">ETH</span>
                          </label>
                        </div>
                        <div className="input-label-row">
                          <label className="input-label">
                            Bridge fee: <span className="value">ETH</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="row padding-1r">
                      {!active ? (
                        <button className="App-cta Exchange-swap-button" onClick={() => connectWallet()}>
                          <Trans>Connect Wallet</Trans>
                        </button>
                      ) : (
                        chainId !== BRIDGE_ETH_CHAIN ? (
                          <button className="App-cta Exchange-swap-button" onClick={() => onNetworkSelect(BRIDGE_ETH_CHAIN)}>
                          <Trans>Switch to {getChainName(BRIDGE_ETH_CHAIN)}</Trans>
                        </button>
                        ) : (
                          <div style={{ display: "flex", justifyContent: "around", alignItems: "center" }}>
                          <button className="default-btn" onClick={()=>onBridge()}  disabled={isSubmitting || amount === 0}>
                            {getButtonText()}
                          </button>
                        </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
          {!isDeposit && (
            <div className="row padding-1r">
              <div className="withdraw-list table-view">
                <table className="token-table">
                  <thead>
                    <tr>
                      <th>
                        <Trans>Hash</Trans>
                      </th>
                      <th>
                        <Trans>Symbol</Trans>
                      </th>
                      <th>
                        <Trans>Amount</Trans>
                      </th>
                      <th>
                        <Trans>isReadyToProve</Trans>
                      </th>
                      <th>
                        <Trans>isProven</Trans>
                      </th>
                      <th>
                        <Trans>isReadyToFinalize</Trans>
                      </th>
                      <th>
                        <Trans>isFinalized</Trans>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawList.map((item) => {
                      return (
                        <tr key={item.blockNumber}>
                          <td>{formatHash(item.hash)}</td>
                          <td>{item.symbol || 'ETH'}</td>
                          <td>{ethers.utils.formatEther(item.value)}</td>
                          <td>{item.isReadyToProve ? 'True' : 'False'}</td>
                          <td>{item.isProven ? 'True' : 'False'}</td>
                          <td>{item.isReadyToFinalize ? 'True' : 'False'}</td>
                          <td>{item.isFinalized ? 'True' : 'False'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
