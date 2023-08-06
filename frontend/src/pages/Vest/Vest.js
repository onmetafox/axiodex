import { useWeb3React } from "@web3-react/core";
import React, { ReactNode, useEffect, useState } from "react";

import moneyIcon from "img/ic_money.svg";
import { Trans, t } from "@lingui/macro";
import "./Vest.css";
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

const PAGE_TITLE = "Vest";
const DESCRIPTION = ["Convert esAXN tokens to AXN tokens.","Prior to using the vaults, please review the vesting details carefully."];

export default function Vest() {
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
        <PageTitle
          title = {PAGE_TITLE}
          descriptions = {DESCRIPTION}
        />
        <div className="Page-content vest">
          <div className="row">
            <div className="col-lg-5 col-sm-12 col-md-12">
              <div className="row padding-1r">
                <div className="Exchange-swap-section strategy-container">
                  <div className="Exchange-swap-section-top">
                    <div className="strategy-title">AXN Vault</div>
                    <div className="align-right strategy-link Tab-option">
                      <ExternalLink href="https://gmxio.gitbook.io/gmx/trading#fees">
                        <img src={moneyIcon} alt="" className="Tab-option-icon" />
                      </ExternalLink>
                    </div>
                  </div>
                  <div className="Exchange-swap-section-bottom strategy-content row">
                    <div className="row padding-1r">
                      <div className="Exchange-swap-section strategy-container sub-section">
                        <div className="Exchange-swap-section-top">
                          <div className="strategy-title">claimable</div>
                          <div className="align-right strategy-link Tab-option">
                            <ExternalLink href="https://gmxio.gitbook.io/gmx/trading#fees">
                              <Trans>Claim page</Trans>
                            </ExternalLink>
                          </div>
                        </div>
                        <div className="Exchange-swap-section-bottom strategy-content">
                          <Trans>{`${formatKeyAmount(vestingData, "gmxVesterClaimable", 18, 4, true)} AXN`}</Trans>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <PageRow title= "Total Staked" 
                        value={formatAmount(totalRewardTokens, 18, 2, true)}
                        direction="align-right" className="page-row-content-deverse"/>
                    </div>
                    <div className="row">
                      <PageRow title= "Reserved for Vesting" 
                        value={`${formatKeyAmount(vestingData, "gmxVesterPairAmount", 18, 2, true)} / ${formatAmount(totalRewardTokens, 18, 2, true)}`}
                        direction="align-right" className="page-row-content-deverse"/>
                    </div>
                    <div className="row">
                      <PageRow title= "Vesting Status" 
                        value={`${formatKeyAmount(vestingData, "gmxVesterClaimSum", 18, 4, true)} / ${formatKeyAmount(vestingData, "gmxVesterVestedAmount", 18, 4, true)}`}
                        direction="align-right" className="page-row-content-deverse"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-sm-12 col-md-12">
              <div className="row padding-1r">
                <div className="Exchange-swap-section strategy-container">
                  <div className="Exchange-swap-section-top">
                    <div className="strategy-title">ALP Vault</div>
                    <div className="align-right strategy-link Tab-option">
                      <ExternalLink href="https://gmxio.gitbook.io/gmx/trading#fees">
                        <img src={moneyIcon} alt="" className="Tab-option-icon" />
                      </ExternalLink>
                    </div>
                  </div>
                  <div className="Exchange-swap-section-bottom strategy-content row">
                    <div className="row padding-1r">
                      <div className="Exchange-swap-section strategy-container sub-section">
                        <div className="Exchange-swap-section-top">
                          <div className="strategy-title">claimable</div>
                          <div className="align-right strategy-link Tab-option">
                            <ExternalLink href="https://gmxio.gitbook.io/gmx/trading#fees">
                              <Trans>Claim page</Trans>
                            </ExternalLink>
                          </div>
                        </div>
                        <div className="Exchange-swap-section-bottom strategy-content">
                          <Trans>{`${formatKeyAmount(vestingData, "glpVesterClaimable", 18, 4, true)} AXN`}</Trans>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <PageRow title= "Stake Tokens" 
                        value={`${formatAmount(processedData.glpBalance, 18, 2, true)} ALP`}
                        direction="align-right" className="page-row-content-deverse"/>
                    </div>
                    <div className="row">
                      <PageRow title= "Reserved for Vesting" 
                        value={`${formatKeyAmount(vestingData, "glpVesterPairAmount", 18, 2, true)} / ${formatAmount(processedData.glpBalance, 18, 2, true)}`}
                        direction="align-right" className="page-row-content-deverse"/>
                    </div>
                    <div className="row">
                      <PageRow title= "Vesting Status" 
                        value={`${formatKeyAmount(vestingData, "glpVesterClaimSum", 18, 4, true)} / ${formatKeyAmount( vestingData, "glpVesterVestedAmount", 18, 4, true)}`}
                        direction="align-right" className="page-row-content-deverse"/>
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
