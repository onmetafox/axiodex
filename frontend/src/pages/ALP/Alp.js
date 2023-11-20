import { useWeb3React } from "@web3-react/core"
import { Trans, t } from "@lingui/macro";
import "./ALP.css";
import PageTitle from "components/PageComponent/PageTitle";
import PageRow from "components/PageComponent/PageRow";
import { Link } from "react-router-dom";

import Vault from "abis/Vault.json";
import ReaderV2 from "abis/ReaderV2.json";
import RewardReader from "abis/RewardReader.json";
import Token from "abis/Token.json";
import AlpManager from "abis/GlpManager.json";

import {
  TLP_DECIMALS,
  USD_DECIMALS,
  PLACEHOLDER_ACCOUNT,
  getBalanceAndSupplyData,
  getDepositBalanceData,
  getVestingData,
  getStakingData,
  getProcessedData,
} from "lib/legacy";
import { useAxnPrice, useTotalAxnStaked, useTotalAxnSupply } from "domain/legacy";
import { getConstant } from "config/chains";

import useSWR from "swr";

import { getContract } from "config/contracts";

// import { getServerUrl } from "config/backend";
import { contractFetcher } from "lib/contracts";
import { bigNumberify, expandDecimals, formatKeyAmount } from "lib/numbers";
import { useChainId } from "lib/chains";

const PAGE_TITLE = "ALP";
const DESCRIPTION = ["The ALP token is automatically staked."];

export default function ALP({ setPendingTxns, connectWallet }) {
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();

  const rewardReaderAddress = getContract("RewardReader");
  const readerAddress = getContract("Reader");

  const vaultAddress = getContract("Vault");
  const nativeTokenAddress = getContract("NATIVE_TOKEN");
  const axnAddress = getContract("AXN");
  const esAxnAddress = getContract("EsAXN");
  const bnAxnAddress = getContract("BnAXN");
  const alpAddress = getContract("ALP");

  const stakedAxnTrackerAddress = getContract("StakedAxnTracker");
  const bonusAxnTrackerAddress = getContract("BonusAxnTracker");
  const feeAxnTrackerAddress = getContract("FeeAxnTracker");

  const stakedAlpTrackerAddress = getContract("StakedAlpTracker");
  const feeAlpTrackerAddress = getContract("FeeAlpTracker");

  const alpManagerAddress = getContract("AlpManager");

  const stakedAxnDistributorAddress = getContract("StakedAxnDistributor");
  const stakedAlpDistributorAddress = getContract("StakedAlpDistributor");

  const axnVesterAddress = getContract("AxnVester");
  const alpVesterAddress = getContract("AlpVester");

  const vesterAddresses = [axnVesterAddress, alpVesterAddress];

  const excludedEsAxnAccounts = [stakedAxnDistributorAddress, stakedAlpDistributorAddress];

  const nativeTokenSymbol = getConstant(chainId, "nativeTokenSymbol");
  const wrappedTokenSymbol = getConstant(chainId, "wrappedTokenSymbol");

  const walletTokens = [axnAddress, esAxnAddress, alpAddress, stakedAxnTrackerAddress];
  const depositTokens = [
    axnAddress,
    esAxnAddress,
    stakedAxnTrackerAddress,
    bonusAxnTrackerAddress,
    bnAxnAddress,
    alpAddress,
  ];
  const rewardTrackersForDepositBalances = [
    stakedAxnTrackerAddress,
    stakedAxnTrackerAddress,
    bonusAxnTrackerAddress,
    feeAxnTrackerAddress,
    feeAxnTrackerAddress,
    feeAlpTrackerAddress,
  ];
  const rewardTrackersForStakingInfo = [
    stakedAxnTrackerAddress,
    bonusAxnTrackerAddress,
    feeAxnTrackerAddress,
    stakedAlpTrackerAddress,
    feeAlpTrackerAddress,
  ];

  const { data: walletBalances } = useSWR(
    [
      `StakeV2:walletBalances:${active}`,
      chainId,
      readerAddress,
      "getTokenBalancesWithSupplies",
      account || PLACEHOLDER_ACCOUNT,
    ],
    {
      fetcher: contractFetcher(library, ReaderV2, [walletTokens]),
    }
  );

  const { data: depositBalances } = useSWR(
    [
      `StakeV2:depositBalances:${active}`,
      chainId,
      rewardReaderAddress,
      "getDepositBalances",
      account || PLACEHOLDER_ACCOUNT,
    ],
    {
      fetcher: contractFetcher(library, RewardReader, [depositTokens, rewardTrackersForDepositBalances]),
    }
  );

  const { data: stakingInfo } = useSWR(
    [`StakeV2:stakingInfo:${active}`, chainId, rewardReaderAddress, "getStakingInfo", account || PLACEHOLDER_ACCOUNT],
    {
      fetcher: contractFetcher(library, RewardReader, [rewardTrackersForStakingInfo]),
    }
  );

  const { data: stakedAxnSupply } = useSWR(
    [`StakeV2:stakedAxnSupply:${active}`, chainId, axnAddress, "balanceOf", stakedAxnTrackerAddress],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  const { data: aums } = useSWR([`StakeV2:getAums:${active}`, chainId, alpManagerAddress, "getAums"], {
    fetcher: contractFetcher(library, AlpManager),
  });

  const { data: nativeTokenPrice } = useSWR(
    [`StakeV2:nativeTokenPrice:${active}`, chainId, vaultAddress, "getMinPrice", nativeTokenAddress],
    {
      fetcher: contractFetcher(library, Vault),
    }
  );

  const { data: esAxnSupply } = useSWR(
    [`StakeV2:esAxnSupply:${active}`, chainId, readerAddress, "getTokenSupply", esAxnAddress],
    {
      fetcher: contractFetcher(library, ReaderV2, [excludedEsAxnAccounts]),
    }
  );

  const { data: vestingInfo } = useSWR(
    [`StakeV2:vestingInfo:${active}`, chainId, readerAddress, "getVestingInfo", account || PLACEHOLDER_ACCOUNT],
    {
      fetcher: contractFetcher(library, ReaderV2, [vesterAddresses]),
    }
  );

  const { axnPrice, /* axnPriceFromArbitrum, axnPriceFromAvalanche, */ axnPriceFromGoerli, axnPriceFromPuppy } = useAxnPrice(
    chainId,
    library,
    active
  );

  // Get total supply of arbitrum and avalanche
  let { total: totalAxnSupply } = useTotalAxnSupply(chainId);

  let {
    avax: avaxAxnStaked,
    arbitrum: arbitrumAxnStaked,
    goerli: goerliAxnStaked,
    puppy: puppyAxnStaked,
    total: totalAxnStaked,
  } = useTotalAxnStaked();

  // const axnSupplyUrl = getServerUrl(chainId, "/axn_supply");
  // const { data: axnSupply } = useSWR([axnSupplyUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.text()),
  // });

  const axnSupply = totalAxnSupply;

  const isAxnTransferEnabled = true;

  let esAxnSupplyUsd;
  if (esAxnSupply && axnPrice) {
    esAxnSupplyUsd = esAxnSupply.mul(axnPrice).div(expandDecimals(1, 18));
  }

  let aum;
  if (aums && aums.length > 0) {
    aum = aums[0].add(aums[1]).div(2);
  }

  const { balanceData, supplyData } = getBalanceAndSupplyData(walletBalances);
  const depositBalanceData = getDepositBalanceData(depositBalances);
  const stakingData = getStakingData(stakingInfo);
  const vestingData = getVestingData(vestingInfo);

  const processedData = getProcessedData(
    balanceData,
    supplyData,
    depositBalanceData,
    stakingData,
    vestingData,
    aum,
    nativeTokenPrice,
    stakedAxnSupply,
    axnPrice,
    axnSupply
  );

  let hasMultiplierPoints = false;
  let multiplierPointsAmount;
  if (processedData && processedData.bonusAxnTrackerRewards && processedData.bnAxnInFeeAxn) {
    multiplierPointsAmount = processedData.bonusAxnTrackerRewards.add(processedData.bnAxnInFeeAxn);
    if (multiplierPointsAmount.gt(0)) {
      hasMultiplierPoints = true;
    }
  }
  let totalRewardTokens;
  if (processedData && processedData.bnAxnInFeeAxn && processedData.bonusAxnInFeeAxn) {
    totalRewardTokens = processedData.bnAxnInFeeAxn.add(processedData.bonusAxnInFeeAxn);
  }

  let totalRewardTokensAndAlp;
  if (totalRewardTokens && processedData && processedData.alpBalance) {
    totalRewardTokensAndAlp = totalRewardTokens.add(processedData.alpBalance);
  }

  const bonusAxnInFeeAxn = processedData ? processedData.bonusAxnInFeeAxn : undefined;

  let stakedAxnSupplyUsd;
  if (totalAxnStaked && !totalAxnStaked.isZero() && axnPrice) {
    stakedAxnSupplyUsd = totalAxnStaked.mul(axnPrice).div(expandDecimals(1, 18));
  }

  let totalSupplyUsd;
  if (totalAxnSupply && !totalAxnSupply.isZero() && axnPrice) {
    totalSupplyUsd = totalAxnSupply.mul(axnPrice).div(expandDecimals(1, 18));
  }

  let maxUnstakeableAxn = bigNumberify(0);
  if (
    totalRewardTokens &&
    vestingData &&
    vestingData.axnVesterPairAmount &&
    multiplierPointsAmount &&
    processedData.bonusAxnInFeeAxn
  ) {
    const availableTokens = totalRewardTokens.sub(vestingData.axnVesterPairAmount);
    const stakedTokens = processedData.bonusAxnInFeeAxn;
    const divisor = multiplierPointsAmount.add(stakedTokens);
    if (divisor.gt(0)) {
      maxUnstakeableAxn = availableTokens.mul(stakedTokens).div(divisor);
    }
  }
  return (
    <>
      <div className="BeginAccountTransfer page-layout alp">
        <PageTitle title={PAGE_TITLE} descriptions = {DESCRIPTION}/>
        <div className="Page-content">
          <div className="row">
            <div className="col-lg-5 col-sm-12 col-md-12">
              {/* <div className="row padding-1r">
                <div className="Exchange-swap-section strategy-container colored border-0">
                  <div className="Exchange-swap-section-top row">
                    <div className="strategy-title">Reward</div>
                    <div className="align-right strategy-link Tab-option">
                    <Link to="/overview">
                        <Trans>Claim page</Trans>
                    </Link>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <PageRow title={`${nativeTokenSymbol} (${wrappedTokenSymbol})`}
                        value={formatKeyAmount(processedData, "totalNativeTokenRewards", 18, 4, true)}
                        subValue = {`$${formatKeyAmount(processedData, "totalNativeTokenRewardsUsd", USD_DECIMALS, 2, true)}`}
                        direction="vertical"/>
                    </div>
                    <div className="col-6 align-right">
                      <PageRow title="esAXN"
                         value={formatKeyAmount(processedData, "totalEsAxnRewards", 18, 4, true)}
                         subValue= {`$${formatKeyAmount(processedData, "totalEsAxnRewardsUsd", USD_DECIMALS, 2, true)}`}
                         direction="vertical"/>
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="Exchange-swap-section strategy-container colored border-0">
                <PageRow title= "ALP" value="Auto-staked ALP earns ETH, esAXN, and MPs." direction="vertical" className="page-row-content"/>
                <PageRow title= "Wallet"
                  value={`${formatKeyAmount(processedData, "alpBalance", TLP_DECIMALS, 2, true)} ALP`}
                  subValue= {`$${formatKeyAmount(processedData, "alpBalanceUsd", USD_DECIMALS, 2, true)}`}
                  direction="vertical" className="page-row-content-deverse"/>
                <PageRow title= "Staked"
                  value={`${formatKeyAmount(processedData, "alpBalance", TLP_DECIMALS, 2, true)} ALP`}
                  subValue = {`$${formatKeyAmount(processedData, "alpBalanceUsd", USD_DECIMALS, 2, true)}`}
                  direction="vertical" className="page-row-content-deverse"/>
              </div>
            </div>
            <div className="col-lg-5 col-sm-12 col-md-12">
              <div className="row padding-1r">
                <div className="Exchange-swap-section strategy-container alp-container">
                  <PageRow title= "ALP price"
                    value={`$${formatKeyAmount(processedData, "alpPrice", USD_DECIMALS, 3, true)}`}
                    direction="vertical" className="page-row-content-deverse"/>
                  {!active && (
                    <button className="App-cta Exchange-swap-button" onClick={() => connectWallet()}>
                      Connect Wallet
                    </button>
                  )}
                  {active && (
                    <div style={{display:'flex', justifyContent:"around", alignItems:"center"}}>
                      <Link className="default-btn" to="/buy_alp">
                        <Trans>Buy ALP</Trans>
                      </Link>
                      <Link className="default-btn" to="/buy_alp#redeem">
                        <Trans>Sell ALP</Trans>
                      </Link>
                    </div>
                  )}
                  <div className="row padding-1r">
                    <div className="col-3"><Trans>AXN APR</Trans></div>
                    <div className="col-9 App-card-divider"></div>
                  </div>
                  <div className="row padding-1r">
                    <div className="col-12 percent-font"><Trans>50.16%</Trans></div>
                  </div>
                  <PageRow title= "Total Staked"
                    value={`${formatKeyAmount(processedData, "alpSupply", 18, 2, true)} ALP ($${formatKeyAmount(processedData, "alpSupplyUsd", USD_DECIMALS, 3, true)})`}
                    direction="align-right" className="page-row-content-deverse"/>
                  <PageRow title= "Total Supply"
                    value={`${formatKeyAmount(processedData, "alpSupply", 18, 2, true)} ALP ($${formatKeyAmount(processedData, "alpSupplyUsd", USD_DECIMALS, 3, true)})`}
                    direction="align-right" className="page-row-content-deverse"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}
