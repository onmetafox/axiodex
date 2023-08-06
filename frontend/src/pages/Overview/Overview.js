import { useState } from "react";

import { useWeb3React } from "@web3-react/core";
import { getContract } from "config/contracts";

import iconOview from "img/ic_overview.svg";
import "./Overview.css";
import PageTitle from "components/PageComponent/PageTitle";
import PageRow from "components/PageComponent/PageRow";
import ImgIcon from "components/IconComponent/ImgIcon";
import Button from "components/Button/Button";

import useSWR from "swr";
import { useChainId } from "lib/chains";
import { contractFetcher } from "lib/contracts";
import { getChainName, getConstant } from "config/chains";
import { bigNumberify, expandDecimals, formatKeyAmount } from "lib/numbers";
import { useGmxPrice, useTotalGmxStaked, useTotalGmxSupply } from "domain/legacy";

import Vault from "abis/Vault.json";
import ReaderV2 from "abis/ReaderV2.json";
import RewardReader from "abis/RewardReader.json";
import Token from "abis/Token.json";
import GlpManager from "abis/GlpManager.json";

import {
  TLP_DECIMALS,
  USD_DECIMALS,
  BASIS_POINTS_DIVISOR,
  PLACEHOLDER_ACCOUNT,
  getBalanceAndSupplyData,
  getDepositBalanceData,
  getVestingData,
  getStakingData,
  getProcessedData,
  getPageTitle,
} from "lib/legacy";

const PAGE_TITLE = "Overview";
const DESCRIPTION = ["By staking MMY or ALP tokens on the Fantom, Optimism and Abitrum networks, you can earn protocol income and rewards. Learn More."];
const REWARDS = "Total rewards";

export default function Overview( {setPendingTxns, connectWallet }) {
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

  const { gmxPrice } = useGmxPrice(
    chainId,
    library,
    active
  );

  // Get total supply of arbitrum and avalanche
  let { total: totalGmxSupply } = useTotalGmxSupply(chainId);

  let {
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
        <PageTitle
          title = {PAGE_TITLE}
          descriptions = {DESCRIPTION}
        />
        <div className="Page-content overview">
          <div className="row">
            <div className="col-lg-5 col-sm-12 col-md-12 ">
              <div className="row padding-1r">
                <div className="Exchange-swap-section strategy-container colored border-0">
                  <div className="Exchange-swap-section-top row">
                    <div className="strategy-title col-6">{REWARDS}</div>
                  </div>
                  <div className="row padding-1r">
                      <ImgIcon icon = {iconOview} alt= {REWARDS} title={REWARDS} value = {`$${(formatKeyAmount(processedData, "totalRewardsUsd", USD_DECIMALS, 2, true))}`}/>
                  </div>
                  <PageRow title={`${nativeTokenSymbol} ( ${wrappedTokenSymbol})`} 
                    value={`${formatKeyAmount(processedData, "totalNativeTokenRewards", 18, 4, true)}`} 
                    subValue={`$${formatKeyAmount(processedData, "totalNativeTokenRewardsUsd", USD_DECIMALS, 2, true)}`}
                    direction="align-right" className="table-row"/>
                  <PageRow title="AXN" 
                    value= {`${formatKeyAmount(processedData, "totalVesterRewards", 18, 4, true)}`} 
                    subValue = {`$${formatKeyAmount(processedData, "totalVesterRewardsUsd", USD_DECIMALS, 2, true)}`} 
                    direction="align-right" className="table-row"/>
                  <PageRow title="esAXN" 
                    value={`${formatKeyAmount(processedData, "totalEsGmxRewards", 18, 4, true)}`}
                    subValue={`$${formatKeyAmount(processedData, "totalEsGmxRewardsUsd", USD_DECIMALS, 2, true)}` } 
                    direction="align-right" className="table-row"/>
                  <PageRow title="Multiplier Points" 
                    value={
                      formatKeyAmount(processedData, "bonusGmxTrackerRewards", 18, 4, true)
                    } 
                    direction="align-right" className="table-row"/>
                  <PageRow title="Staked Multiplier Points" 
                    value={
                      formatKeyAmount(processedData, "bnGmxInFeeGmx", 18, 4, true)
                    } 
                    direction="align-right" className="table-row"/>
                  <div className="row padding-1r">
                    {!active && (
                      <button className="App-cta Exchange-swap-button" onClick={() => connectWallet()}>
                        Connect Wallet
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-sm-12 col-md-12 text-align-btn padding-1r">
              <div className="row">
                <div className="Exchange-swap-section strategy-container">
                  <div className="row">
                    <div className="col-5">
                      <PageRow title="AXN & esAXN staked" value="0.00 $0.00" direction="vertical"/>
                    </div>
                    <div className="col-3">
                      <PageRow title="APR" value="50.16%" direction="vertical"/>
                    </div>
                    <div className="col-4">
                      <Button className="strategy-btn" href="/axes">Details</Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="Exchange-swap-section strategy-container">
                  <div className="row">
                    <div className="col-5">
                      <PageRow title="MLP staked" value="0.00 $0.00" direction="vertical"/>
                    </div>
                    <div className="col-3">
                      <PageRow title="APR" value="133.62%" direction="vertical"/>
                    </div>
                    <div className="col-4">
                      <Button className="strategy-btn" href="mlp">Details</Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="Exchange-swap-section strategy-container">
                  <div className="row">
                    <div className="col-5">
                      <PageRow title="Vesting status" value="0.0000 / 0.0000" direction="vertical"/>
                    </div>
                    <div className="col-3">
                    </div>
                    <div className="col-4">
                      <Button className="strategy-btn" href="vest">Details</Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="Exchange-swap-section strategy-container">
                  <div className="row">
                    <div className="col-5">
                      <PageRow title="Deposited in vault" value="$0" direction="vertical"/>
                    </div>
                    <div className="col-3">
                    </div>
                    <div className="col-4">
                      <Button className="strategy-btn" href="vault">Details</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
    
  )
}
