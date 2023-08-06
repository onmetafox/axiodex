import { useWeb3React } from "@web3-react/core";
import { Trans, t } from "@lingui/macro";
import "./Axes.css";
import ExternalLink from "components/ExternalLink/ExternalLink";
import PageTitle from "components/PageComponent/PageTitle";
import PageRow from "components/PageComponent/PageRow";


import Vault from "abis/Vault.json";
import ReaderV2 from "abis/ReaderV2.json";
import RewardReader from "abis/RewardReader.json";
import Token from "abis/Token.json";
import GlpManager from "abis/GlpManager.json";

import {
  USD_DECIMALS,
  PLACEHOLDER_ACCOUNT,
  getBalanceAndSupplyData,
  getDepositBalanceData,
  getVestingData,
  getStakingData,
  getProcessedData,
} from "lib/legacy";
import { useGmxPrice, useTotalGmxStaked, useTotalGmxSupply } from "domain/legacy";
import { getConstant } from "config/chains";

import useSWR from "swr";

import { getContract } from "config/contracts";

// import { getServerUrl } from "config/backend";
import { contractFetcher } from "lib/contracts";
import { bigNumberify, expandDecimals, formatAmount, formatAmountFree, formatKeyAmount, parseValue } from "lib/numbers";
import { useChainId } from "lib/chains";

const PAGE_TITLE = "AXN & esAXN";
const DESCRIPTION = ["Earn rewards by staking AXN and esAXN tokens."];

export default function Axes({ setPendingTxns, connectWallet }) {
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();

  const rewardReaderAddress = getContract("RewardReader");
  const readerAddress = getContract("Reader");

  const vaultAddress = getContract("Vault");
  const nativeTokenAddress = getContract("NATIVE_TOKEN");
  const gmxAddress = getContract("AXN");
  const esGmxAddress = getContract("EsAXN");
  const bnGmxAddress = getContract("BnAXN");
  const glpAddress = getContract("ALP");

  const stakedGmxTrackerAddress = getContract("StakedAxnTracker");
  const bonusGmxTrackerAddress = getContract("BonusAxnTracker");
  const feeGmxTrackerAddress = getContract("FeeAxnTracker");

  const stakedGlpTrackerAddress = getContract("StakedAlpTracker");
  const feeGlpTrackerAddress = getContract("FeeAlpTracker");

  const glpManagerAddress = getContract("AlpManager");

  const stakedGmxDistributorAddress = getContract("StakedAxnDistributor");
  const stakedGlpDistributorAddress = getContract("StakedAlpDistributor");

  const gmxVesterAddress = getContract("AxnVester");
  const glpVesterAddress = getContract("AlpVester");

  const vesterAddresses = [gmxVesterAddress, glpVesterAddress];

  const excludedEsGmxAccounts = [stakedGmxDistributorAddress, stakedGlpDistributorAddress];

  const nativeTokenSymbol = getConstant(chainId, "nativeTokenSymbol");
  const wrappedTokenSymbol = getConstant(chainId, "wrappedTokenSymbol");

  const walletTokens = [gmxAddress, esGmxAddress, glpAddress, stakedGmxTrackerAddress];
  const depositTokens = [
    gmxAddress,
    esGmxAddress,
    stakedGmxTrackerAddress,
    bonusGmxTrackerAddress,
    bnGmxAddress,
    glpAddress,
  ];
  const rewardTrackersForDepositBalances = [
    stakedGmxTrackerAddress,
    stakedGmxTrackerAddress,
    bonusGmxTrackerAddress,
    feeGmxTrackerAddress,
    feeGmxTrackerAddress,
    feeGlpTrackerAddress,
  ];
  const rewardTrackersForStakingInfo = [
    stakedGmxTrackerAddress,
    bonusGmxTrackerAddress,
    feeGmxTrackerAddress,
    stakedGlpTrackerAddress,
    feeGlpTrackerAddress,
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

  const { data: stakedGmxSupply } = useSWR(
    [`StakeV2:stakedGmxSupply:${active}`, chainId, gmxAddress, "balanceOf", stakedGmxTrackerAddress],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  const { data: aums } = useSWR([`StakeV2:getAums:${active}`, chainId, glpManagerAddress, "getAums"], {
    fetcher: contractFetcher(library, GlpManager),
  });

  const { data: nativeTokenPrice } = useSWR(
    [`StakeV2:nativeTokenPrice:${active}`, chainId, vaultAddress, "getMinPrice", nativeTokenAddress],
    {
      fetcher: contractFetcher(library, Vault),
    }
  );

  const { data: esGmxSupply } = useSWR(
    [`StakeV2:esGmxSupply:${active}`, chainId, readerAddress, "getTokenSupply", esGmxAddress],
    {
      fetcher: contractFetcher(library, ReaderV2, [excludedEsGmxAccounts]),
    }
  );

  const { data: vestingInfo } = useSWR(
    [`StakeV2:vestingInfo:${active}`, chainId, readerAddress, "getVestingInfo", account || PLACEHOLDER_ACCOUNT],
    {
      fetcher: contractFetcher(library, ReaderV2, [vesterAddresses]),
    }
  );

  const { gmxPrice, /* gmxPriceFromArbitrum, gmxPriceFromAvalanche, */ gmxPriceFromGoerli, gmxPriceFromPuppy } = useGmxPrice(
    chainId,
    library,
    active
  );

  // Get total supply of arbitrum and avalanche
  let { total: totalGmxSupply } = useTotalGmxSupply(chainId);

  let {
    avax: avaxGmxStaked,
    arbitrum: arbitrumGmxStaked,
    goerli: goerliGmxStaked,
    puppy: puppyGmxStaked,
    total: totalGmxStaked,
  } = useTotalGmxStaked();

  const gmxSupply = totalGmxSupply;

  let esGmxSupplyUsd;
  if (esGmxSupply && gmxPrice) {
    esGmxSupplyUsd = esGmxSupply.mul(gmxPrice).div(expandDecimals(1, 18));
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
    stakedGmxSupply,
    gmxPrice,
    gmxSupply
  );

  let hasMultiplierPoints = false;
  let multiplierPointsAmount;
  if (processedData && processedData.bonusGmxTrackerRewards && processedData.bnGmxInFeeGmx) {
    multiplierPointsAmount = processedData.bonusGmxTrackerRewards.add(processedData.bnGmxInFeeGmx);
    if (multiplierPointsAmount.gt(0)) {
      hasMultiplierPoints = true;
    }
  }
  let totalRewardTokens;
  if (processedData && processedData.bnGmxInFeeGmx && processedData.bonusGmxInFeeGmx) {
    totalRewardTokens = processedData.bnGmxInFeeGmx.add(processedData.bonusGmxInFeeGmx);
  }

  let totalRewardTokensAndGlp;
  if (totalRewardTokens && processedData && processedData.glpBalance) {
    totalRewardTokensAndGlp = totalRewardTokens.add(processedData.glpBalance);
  }

  let stakedGmxSupplyUsd;
  if (totalGmxStaked && !totalGmxStaked.isZero() && gmxPrice) {
    stakedGmxSupplyUsd = totalGmxStaked.mul(gmxPrice).div(expandDecimals(1, 18));
  }

  let totalSupplyUsd;
  if (totalGmxSupply && !totalGmxSupply.isZero() && gmxPrice) {
    totalSupplyUsd = totalGmxSupply.mul(gmxPrice).div(expandDecimals(1, 18));
  }

  let maxUnstakeableGmx = bigNumberify(0);
  if (
    totalRewardTokens &&
    vestingData &&
    vestingData.gmxVesterPairAmount &&
    multiplierPointsAmount &&
    processedData.bonusGmxInFeeGmx
  ) {
    const availableTokens = totalRewardTokens.sub(vestingData.gmxVesterPairAmount);
    const stakedTokens = processedData.bonusGmxInFeeGmx;
    const divisor = multiplierPointsAmount.add(stakedTokens);
    if (divisor.gt(0)) {
      maxUnstakeableGmx = availableTokens.mul(stakedTokens).div(divisor);
    }
  }
  return (
    <>
      <div className="BeginAccountTransfer page-layout">
        <PageTitle title = {PAGE_TITLE} descriptions = {DESCRIPTION} />
        <div className="Page-content axes">
          <div className="row">
            <div className="col-lg-5 col-sm-12 col-md-12">
              <div className="row padding-1r">
                <div className="Exchange-swap-section strategy-container colored border-0">
                  <div className="Exchange-swap-section-top row">
                    <div className="strategy-title">Reward</div>
                    <div className="align-right strategy-link Tab-option">
                    <ExternalLink href="https://gmxio.gitbook.io/gmx/trading#fees">
                        <Trans>Claim page</Trans>
                    </ExternalLink>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <PageRow title={`${nativeTokenSymbol}(${wrappedTokenSymbol})`} 
                        value={formatKeyAmount(processedData, "totalNativeTokenRewards", 18, 4, true)} 
                        subValue = {`$${formatKeyAmount(processedData, "totalNativeTokenRewardsUsd", USD_DECIMALS, 2, true)}`}
                        direction="vertical"/>
                    </div>
                    <div className="col-6 align-right">
                      <PageRow title="esAXN" 
                        value={formatKeyAmount(processedData, "totalEsGmxRewards", 18, 4, true)} 
                        subValue= {`$${formatKeyAmount(processedData, "totalEsGmxRewardsUsd", USD_DECIMALS, 2, true)}`} 
                        direction="vertical"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="Exchange-swap-section strategy-container colored border-0">
                <PageRow title="AXN" value ="Stake AXN to earn FTM, esAXN, and MPs" direction="vertical"  className="page-row-content"/>
                <PageRow title="Wallet" 
                  value ={ `${formatKeyAmount(processedData, "gmxBalance", 18, 2, true)} AXN`}
                  subValue = {`$${formatKeyAmount(processedData, "gmxBalanceUsd", USD_DECIMALS, 2, true)}`} 
                  direction="vertical"  className="page-row-content-deverse"/>
                <PageRow title="Staked" value ={`$${formatKeyAmount(processedData, "gmxInStakedGmx", 18, 2, true)} AXN`}
                  subValue ={`$${formatKeyAmount(processedData, "gmxInStakedGmxUsd", USD_DECIMALS, 2, true)}`} 
                  direction="vertical"  className="page-row-content-deverse"/>
                <div className="row padding-1r">
                  {!active && (
                    <button className="App-cta Exchange-swap-button" onClick={() => connectWallet()}>
                      Connect Wallet
                    </button>
                  )}
                </div>
              </div>
              <div className="Exchange-swap-section strategy-container colored border-0 mt-5">
                <PageRow title="esAXN" value ="Stake esAXN to earn FTM, esAXN, and MPs." direction="vertical"  className="page-row-content"/>
                <PageRow title="Wallet" 
                  value ={`${formatKeyAmount(processedData, "esGmxBalance", 18, 2, true)} esAXN`}
                  subValue = {`$${formatKeyAmount(processedData, "esGmxBalanceUsd", USD_DECIMALS, 2, true)}`} 
                  direction="vertical"  className="page-row-content-deverse"/>
                <PageRow title="Staked" 
                  value ={`${formatKeyAmount(processedData, "esGmxInStakedGmx", 18, 2, true)} esAXN`}
                  subValue = {`$${formatKeyAmount(processedData, "esGmxInStakedGmxUsd", USD_DECIMALS, 2, true)}`} 
                  direction="vertical"  className="page-row-content-deverse"/>
                <div className="row">
                  {!active && (
                    <button className="App-cta Exchange-swap-button" onClick={() => connectWallet()}>
                      Connect Wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-sm-12 col-md-12">
              <div className="row padding-1r">
                <div className="Exchange-swap-section strategy-container alp-container">
                  <PageRow title="ALP price" 
                  value = {`$${formatKeyAmount(processedData, "glpPrice", USD_DECIMALS, 3, true)}`} direction="vertical"  className="page-row-content-deverse"/>
                  <div className="row">
                    {!active && (
                      <button className="App-cta Exchange-swap-button mt-5" onClick={() => connectWallet()}>
                        Connect Wallet
                      </button>
                    )}
                  </div>
                  <div className="row divider-row">
                    <div className="col-3"><Trans>AXN APR</Trans></div>
                    <div className="col-9 App-card-divider"></div>
                  </div>
                  <div className="row">
                    <div className="col-12 percent-font"><Trans>50.16%</Trans></div>
                  </div>
                  <PageRow title="Total Staked" 
                    value ={`${formatKeyAmount(processedData, "stakedEsGmxSupply", 18, 0, true)} AXN ($${formatKeyAmount(processedData, "stakedEsGmxSupplyUsd", USD_DECIMALS, 0, true)})`} 
                    direction="align-right"  className="page-row-content-deverse"/>
                  <PageRow title="Total Supply" 
                    value ={`${formatAmount(esGmxSupply, 18, 0, true)} AXN ($${formatAmount(esGmxSupplyUsd, USD_DECIMALS, 0, true)})`} 
                    direction="align-right"  className="page-row-content-deverse"/>
                  <PageRow title="MPs APR" value ="100%" direction="align-right"  className="page-row-content-deverse"/>
                  <PageRow title="Boost Percentage" 
                    value ={`${formatAmount(processedData.boostBasisPoints, 2, 2, false)}%`} 
                    direction="align-right"  className="page-row-content-deverse"/>
                  <div className="row divider-row">
                    <div className="col-3"><Trans>esAXN APR</Trans></div>
                    <div className="col-9 App-card-divider"></div>
                  </div>
                  <div className="row">
                    <div className="col-12 percent-font" ><Trans>50.16%</Trans></div>
                  </div>
                  <PageRow title="Total Staked" 
                    value ={`${formatAmount(totalGmxStaked, 18, 0, true)} esAXN ($${formatAmount(stakedGmxSupplyUsd, USD_DECIMALS, 0, true)})`} 
                    direction="align-right"  className="page-row-content-deverse"/>
                  <PageRow title="Total Supply" 
                    value ={`${formatAmount(totalGmxSupply, 18, 0, true)} esAXN ($${formatAmount(totalSupplyUsd, USD_DECIMALS, 0, true)})`} 
                    direction="align-right"  className="page-row-content-deverse"/>
                  <PageRow title="MPs APR" value ="100%" direction="align-right"  className="page-row-content-deverse"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
    
  )
}
