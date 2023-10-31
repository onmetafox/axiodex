import { useWeb3React } from "@web3-react/core";
import { Trans, t } from "@lingui/macro";
import "./Axes.css";
import PageTitle from "components/PageComponent/PageTitle";
import PageRow from "components/PageComponent/PageRow";
import { Link } from "react-router-dom";
import Vault from "abis/Vault.json";
import ReaderV2 from "abis/ReaderV2.json";
import RewardRouter from "abis/RewardRouter.json";
import RewardReader from "abis/RewardReader.json";
import Token from "abis/Token.json";
import GlpManager from "abis/GlpManager.json";
import Modal from "components/Modal/Modal";


import { ethers } from "ethers";
import { useState } from 'react';

import {
  TLP_DECIMALS,
  USD_DECIMALS,
  PLACEHOLDER_ACCOUNT,
  BASIS_POINTS_DIVISOR,
  getBalanceAndSupplyData,
  getDepositBalanceData,
  getVestingData,
  getStakingData,
  getProcessedData,
} from "lib/legacy";

import { approveTokens } from "domain/tokens";
import { useAxnPrice, useTotalAxnStaked, useTotalAxnSupply } from "domain/legacy";
import { getConstant } from "config/chains";

import useSWR from "swr";

import { getContract } from "config/contracts";

// import { getServerUrl } from "config/backend";
import { callContract, contractFetcher } from "lib/contracts";
import { bigNumberify, expandDecimals, formatAmount, formatAmountFree, formatKeyAmount, parseValue } from "lib/numbers";
import { useChainId } from "lib/chains";

const PAGE_TITLE = "Staking";
const DESCRIPTION = ["Earn rewards by staking AXN and esAXN tokens."];

const { AddressZero } = ethers.constants;

function StakeModal(props) {
  const {
    isVisible,
    setIsVisible,
    chainId,
    title,
    maxAmount,
    value,
    setValue,
    active,
    account,
    library,
    stakingTokenSymbol,
    stakingTokenAddress,
    farmAddress,
    rewardRouterAddress,
    stakeMethodName,
    setPendingTxns,
  } = props;

  const [isStaking, setIsStaking] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const { data: tokenAllowance } = useSWR(
    active && stakingTokenAddress && [active, chainId, stakingTokenAddress, "allowance", account, farmAddress],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  let amount = parseValue(value, 18);
  const needApproval = farmAddress !== AddressZero && tokenAllowance && amount && amount.gt(tokenAllowance);

  const getError = () => {
    if (!amount || amount.eq(0)) {
      return t`Enter an amount`;
    }
    if (maxAmount && amount.gt(maxAmount)) {
      return t`Max amount exceeded`;
    }
  };

  const onClickPrimary = () => {
    if (needApproval) {
      approveTokens({
        setIsApproving,
        library,
        tokenAddress: stakingTokenAddress,
        spender: farmAddress,
        chainId,
      });
      return;
    }

    setIsStaking(true);
    const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());

    callContract(chainId, contract, stakeMethodName, [amount], {
      sentMsg: t`Stake submitted!`,
      failMsg: t`Stake failed.`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsStaking(false);
      });
  };

  const isPrimaryEnabled = () => {
    const error = getError();
    if (error) {
      return false;
    }
    if (isApproving) {
      return false;
    }
    if (isStaking) {
      return false;
    }
    return true;
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (isApproving) {
      return t`Approving ${stakingTokenSymbol}...`;
    }
    if (needApproval) {
      return t`Approve ${stakingTokenSymbol}`;
    }
    if (isStaking) {
      return t`Staking...`;
    }
    return t`Stake`;
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title}>
        <div className="Exchange-swap-section">
          <div className="Exchange-swap-section-top">
            <div className="muted">
              <div className="Exchange-swap-usd">
                <Trans>Stake</Trans>
              </div>
            </div>
            <div className="muted align-right clickable" onClick={() => setValue(formatAmountFree(maxAmount, 18, 18))}>
              <Trans>Max: {formatAmount(maxAmount, 18, 4, true)}</Trans>
            </div>
          </div>
          <div className="Exchange-swap-section-bottom">
            <div>
              <input
                type="number"
                placeholder="0.0"
                className="Exchange-swap-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="PositionEditor-token-symbol">{stakingTokenSymbol}</div>
          </div>
        </div>
        <div className="Exchange-swap-button-container">
          <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={!isPrimaryEnabled()}>
            {getPrimaryText()}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function UnstakeModal(props) {
  const {
    isVisible,
    setIsVisible,
    chainId,
    title,
    maxAmount,
    value,
    setValue,
    library,
    unstakingTokenSymbol,
    rewardRouterAddress,
    unstakeMethodName,
    multiplierPointsAmount,
    reservedAmount,
    bonusAxnInFeeAxn,
    setPendingTxns,
  } = props;
  const [isUnstaking, setIsUnstaking] = useState(false);

  let amount = parseValue(value, 18);
  let burnAmount;

  if (
    multiplierPointsAmount &&
    multiplierPointsAmount.gt(0) &&
    amount &&
    amount.gt(0) &&
    bonusAxnInFeeAxn &&
    bonusAxnInFeeAxn.gt(0)
  ) {
    burnAmount = multiplierPointsAmount.mul(amount).div(bonusAxnInFeeAxn);
  }

  const shouldShowReductionAmount = true;
  let rewardReductionBasisPoints;
  if (burnAmount && bonusAxnInFeeAxn) {
    rewardReductionBasisPoints = burnAmount.mul(BASIS_POINTS_DIVISOR).div(bonusAxnInFeeAxn);
  }

  const getError = () => {
    if (!amount) {
      return t`Enter an amount`;
    }
    if (amount.gt(maxAmount)) {
      return t`Max amount exceeded`;
    }
  };

  const onClickPrimary = () => {
    setIsUnstaking(true);
    const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());
    callContract(chainId, contract, unstakeMethodName, [amount], {
      sentMsg: t`Unstake submitted!`,
      failMsg: t`Unstake failed.`,
      successMsg: t`Unstake completed!`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsUnstaking(false);
      });
  };

  const isPrimaryEnabled = () => {
    const error = getError();
    if (error) {
      return false;
    }
    if (isUnstaking) {
      return false;
    }
    return true;
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (isUnstaking) {
      return t`Unstaking...`;
    }
    return t`Unstake`;
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title}>
        <div className="Exchange-swap-section">
          <div className="Exchange-swap-section-top">
            <div className="muted">
              <div className="Exchange-swap-usd">
                <Trans>Unstake</Trans>
              </div>
            </div>
            <div className="muted align-right clickable" onClick={() => setValue(formatAmountFree(maxAmount, 18, 18))}>
              <Trans>Max: {formatAmount(maxAmount, 18, 4, true)}</Trans>
            </div>
          </div>
          <div className="Exchange-swap-section-bottom">
            <div>
              <input
                type="number"
                placeholder="0.0"
                className="Exchange-swap-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="PositionEditor-token-symbol">{unstakingTokenSymbol}</div>
          </div>
        </div>
        {reservedAmount && reservedAmount.gt(0) && (
          <div className="Modal-note">
            You have {formatAmount(reservedAmount, 18, 2, true)} tokens reserved for vesting.
          </div>
        )}
        {burnAmount && burnAmount.gt(0) && rewardReductionBasisPoints && rewardReductionBasisPoints.gt(0) && (
          <div className="Modal-note">
            <Trans>
              Unstaking will burn&nbsp;
              {/* <ExternalLink href="https://axnio.gitbook.io/axn/rewards">
                {formatAmount(burnAmount, 18, 4, true)} Multiplier Points
              </ExternalLink> */}
              .&nbsp;
              {shouldShowReductionAmount && (
                <span>Boost Percentage: -{formatAmount(rewardReductionBasisPoints, 2, 2)}%.</span>
              )}
            </Trans>
          </div>
        )}
        <div className="Exchange-swap-button-container">
          <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={!isPrimaryEnabled()}>
            {getPrimaryText()}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function Axes({ setPendingTxns, connectWallet }) {
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();

  const [isStakeModalVisible, setIsStakeModalVisible] = useState(false);
  const [stakeModalTitle, setStakeModalTitle] = useState("");
  const [stakeModalMaxAmount, setStakeModalMaxAmount] = useState(undefined);
  const [stakeValue, setStakeValue] = useState("");
  const [stakingTokenSymbol, setStakingTokenSymbol] = useState("");
  const [stakingTokenAddress, setStakingTokenAddress] = useState("");
  const [stakingFarmAddress, setStakingFarmAddress] = useState("");
  const [stakeMethodName, setStakeMethodName] = useState("");

  const [isUnstakeModalVisible, setIsUnstakeModalVisible] = useState(false);
  const [unstakeModalTitle, setUnstakeModalTitle] = useState("");
  const [unstakeModalMaxAmount, setUnstakeModalMaxAmount] = useState(undefined);
  const [unstakeModalReservedAmount, setUnstakeModalReservedAmount] = useState(undefined);
  const [unstakeValue, setUnstakeValue] = useState("");
  const [unstakingTokenSymbol, setUnstakingTokenSymbol] = useState("");
  const [unstakeMethodName, setUnstakeMethodName] = useState("");

  const rewardRouterAddress = getContract("RewardRouter");
  const rewardReaderAddress = getContract("RewardReader");
  const readerAddress = getContract("Reader");

  const vaultAddress = getContract("Vault");
  const nativeTokenAddress = getContract("NATIVE_TOKEN");
  const axnAddress = getContract("AXN");
  const esAxnAddress = getContract("EsAXN");
  const bnAxnAddress = getContract("BnAXN");
  const glpAddress = getContract("ALP");

  const stakedAxnTrackerAddress = getContract("StakedAxnTracker");
  const bonusAxnTrackerAddress = getContract("BonusAxnTracker");
  const feeAxnTrackerAddress = getContract("FeeAxnTracker");

  const stakedGlpTrackerAddress = getContract("StakedAlpTracker");
  const feeGlpTrackerAddress = getContract("FeeAlpTracker");

  const glpManagerAddress = getContract("AlpManager");

  const stakedAxnDistributorAddress = getContract("StakedAxnDistributor");
  const stakedGlpDistributorAddress = getContract("StakedAlpDistributor");

  const axnVesterAddress = getContract("AxnVester");
  const glpVesterAddress = getContract("AlpVester");

  const vesterAddresses = [axnVesterAddress, glpVesterAddress];

  const excludedEsAxnAccounts = [stakedAxnDistributorAddress, stakedGlpDistributorAddress];

  const nativeTokenSymbol = getConstant(chainId, "nativeTokenSymbol");
  const wrappedTokenSymbol = getConstant(chainId, "wrappedTokenSymbol");

  const walletTokens = [axnAddress, esAxnAddress, glpAddress, stakedAxnTrackerAddress];
  const depositTokens = [
    axnAddress,
    esAxnAddress,
    stakedAxnTrackerAddress,
    bonusAxnTrackerAddress,
    bnAxnAddress,
    glpAddress,
  ];
  const rewardTrackersForDepositBalances = [
    stakedAxnTrackerAddress,
    stakedAxnTrackerAddress,
    bonusAxnTrackerAddress,
    feeAxnTrackerAddress,
    feeAxnTrackerAddress,
    feeGlpTrackerAddress,
  ];
  const rewardTrackersForStakingInfo = [
    stakedAxnTrackerAddress,
    bonusAxnTrackerAddress,
    feeAxnTrackerAddress,
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

  const { data: stakedAxnSupply } = useSWR(
    [`StakeV2:stakedAxnSupply:${active}`, chainId, axnAddress, "balanceOf", stakedAxnTrackerAddress],
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

  const axnSupply = totalAxnSupply;

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

  let totalRewardTokensAndGlp;
  if (totalRewardTokens && processedData && processedData.glpBalance) {
    totalRewardTokensAndGlp = totalRewardTokens.add(processedData.glpBalance);
  }

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



  const showStakeAxnModal = () => {
    // if (!isAxnTransferEnabled) {
    //   helperToast.error(t`AXN transfers not yet enabled`);
    //   return;
    // }

    setIsStakeModalVisible(true);
    setStakeModalTitle(t`Stake AXN`);
    setStakeModalMaxAmount(processedData.axnBalance);
    setStakeValue("");
    setStakingTokenSymbol("AXN");
    setStakingTokenAddress(axnAddress);
    setStakingFarmAddress(stakedAxnTrackerAddress);
    setStakeMethodName("stakeAxn");
  };

  const showUnstakeAxnModal = () => {
    // if (!isAxnTransferEnabled) {
    //   helperToast.error(t`AXN transfers not yet enabled`);
    //   return;
    // }
    setIsUnstakeModalVisible(true);
    setUnstakeModalTitle(t`Unstake AXN`);
    let maxAmount = processedData.axnInStakedAxn;
    if (
      processedData.axnInStakedAxn &&
      vestingData &&
      vestingData.axnVesterPairAmount.gt(0) &&
      maxUnstakeableAxn &&
      maxUnstakeableAxn.lt(processedData.axnInStakedAxn)
    ) {
      maxAmount = maxUnstakeableAxn;
    }
    setUnstakeModalMaxAmount(maxAmount);
    setUnstakeModalReservedAmount(vestingData.axnVesterPairAmount);
    setUnstakeValue("");
    setUnstakingTokenSymbol("AXN");
    setUnstakeMethodName("unstakeAxn");
  };

  const showStakeEsAxnModal = () => {
    setIsStakeModalVisible(true);
    setStakeModalTitle(t`Stake esAXN`);
    setStakeModalMaxAmount(processedData.esAxnBalance);
    setStakeValue("");
    setStakingTokenSymbol("esAXN");
    setStakingTokenAddress(esAxnAddress);
    setStakingFarmAddress(AddressZero);
    setStakeMethodName("stakeEsAxn");
  };

  const showUnstakeEsAxnModal = () => {
    setIsUnstakeModalVisible(true);
    setUnstakeModalTitle(t`Unstake esAXN`);
    let maxAmount = processedData.esAxnInStakedAxn;
    if (
      processedData.esAxnInStakedAxn &&
      vestingData &&
      vestingData.axnVesterPairAmount.gt(0) &&
      maxUnstakeableAxn &&
      maxUnstakeableAxn.lt(processedData.esAxnInStakedAxn)
    ) {
      maxAmount = maxUnstakeableAxn;
    }
    setUnstakeModalMaxAmount(maxAmount);
    setUnstakeModalReservedAmount(vestingData.axnVesterPairAmount);
    setUnstakeValue("");
    setUnstakingTokenSymbol("esAXN");
    setUnstakeMethodName("unstakeEsAxn");
  };

  const bonusAxnInFeeAxn = processedData ? processedData.bonusAxnInFeeAxn : undefined;

  return (
    <>
      <div className="BeginAccountTransfer page-layout">
      <StakeModal
          isVisible={isStakeModalVisible}
          setIsVisible={setIsStakeModalVisible}
          chainId={chainId}
          title={stakeModalTitle}
          maxAmount={stakeModalMaxAmount}
          value={stakeValue}
          setValue={setStakeValue}
          active={active}
          account={account}
          library={library}
          stakingTokenSymbol={stakingTokenSymbol}
          stakingTokenAddress={stakingTokenAddress}
          farmAddress={stakingFarmAddress}
          rewardRouterAddress={rewardRouterAddress}
          stakeMethodName={stakeMethodName}
          hasMultiplierPoints={hasMultiplierPoints}
          setPendingTxns={setPendingTxns}
          nativeTokenSymbol={nativeTokenSymbol}
          wrappedTokenSymbol={wrappedTokenSymbol}
        />
      <UnstakeModal
        setPendingTxns={setPendingTxns}
        isVisible={isUnstakeModalVisible}
        setIsVisible={setIsUnstakeModalVisible}
        chainId={chainId}
        title={unstakeModalTitle}
        maxAmount={unstakeModalMaxAmount}
        reservedAmount={unstakeModalReservedAmount}
        value={unstakeValue}
        setValue={setUnstakeValue}
        library={library}
        unstakingTokenSymbol={unstakingTokenSymbol}
        rewardRouterAddress={rewardRouterAddress}
        unstakeMethodName={unstakeMethodName}
        multiplierPointsAmount={multiplierPointsAmount}
        bonusAxnInFeeAxn={bonusAxnInFeeAxn}
      />
        <PageTitle title = {PAGE_TITLE} descriptions = {DESCRIPTION} />
        <div className="Page-content axes">
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
                      <PageRow title={`${nativeTokenSymbol}(${wrappedTokenSymbol})`}
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
                <PageRow title="AXN" value ="Stake AXN to earn ETH, esAXN, and MPs" direction="vertical"  className="page-row-content"/>
                <PageRow title="Wallet"
                  value ={ `${formatKeyAmount(processedData, "axnBalance", 18, 2, true)} AXN`}
                  subValue = {`$${formatKeyAmount(processedData, "axnBalanceUsd", USD_DECIMALS, 2, true)}`}
                  direction="vertical"  className="page-row-content-deverse"/>
                <PageRow title="Staked" value ={`$${formatKeyAmount(processedData, "axnInStakedAxn", 18, 2, true)} AXN`}
                  subValue ={`$${formatKeyAmount(processedData, "axnInStakedAxnUsd", USD_DECIMALS, 2, true)}`}
                  direction="vertical"  className="page-row-content-deverse"/>
                <div className="row padding-1r">
                  {!active && (
                    <button className="App-cta Exchange-swap-button" onClick={() => connectWallet()}>
                      Connect Wallet
                    </button>
                  )}
                  {active && (
                    <div style={{display:'flex', justifyContent:"around", alignItems:"center"}}>
                      <button className="default-btn" onClick={() => showStakeAxnModal()}>
                        <Trans>Stake</Trans>
                      </button>
                      <button className="default-btn" onClick={() => showUnstakeAxnModal()}>
                        <Trans>Unstake</Trans>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="Exchange-swap-section strategy-container colored border-0 mt-5">
                <PageRow title="esAXN" value ="Stake esAXN to earn ETH, esAXN, and MPs." direction="vertical"  className="page-row-content"/>
                <PageRow title="Wallet"
                  value ={`${formatKeyAmount(processedData, "esAxnBalance", 18, 2, true)} esAXN`}
                  subValue = {`$${formatKeyAmount(processedData, "esAxnBalanceUsd", USD_DECIMALS, 2, true)}`}
                  direction="vertical"  className="page-row-content-deverse"/>
                <PageRow title="Staked"
                  value ={`${formatKeyAmount(processedData, "esAxnInStakedAxn", 18, 2, true)} esAXN`}
                  subValue = {`$${formatKeyAmount(processedData, "esAxnInStakedAxnUsd", USD_DECIMALS, 2, true)}`}
                  direction="vertical"  className="page-row-content-deverse"/>
                <div className="row">
                  {!active && (
                    <button className="App-cta Exchange-swap-button" onClick={() => connectWallet()}>
                      Connect Wallet
                    </button>
                  )}

                  {active && (
                    <div style={{display:'flex', justifyContent:"around", alignItems:"center"}}>
                      <button className="default-btn" onClick={() => showStakeEsAxnModal()}>
                        <Trans>Stake</Trans>
                      </button>
                      <button className="default-btn" onClick={() => showUnstakeEsAxnModal()}>
                        <Trans>Unstake</Trans>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-7 col-sm-12 col-md-12">
              <div className="row padding-1r">
                <div className="Exchange-swap-section strategy-container alp-container">
                  <PageRow title="AXN price"
                  value = {`$${formatAmount(axnPrice, USD_DECIMALS, 3, true)}`} direction="vertical"  className="page-row-content-deverse"/>
                  <div className="row">
                    {!active && (
                      <button className="App-cta Exchange-swap-button mt-5" onClick={() => connectWallet()}>
                        Connect Wallet
                      </button>
                    )}
                    {active && (
                    <>
                    <Link className="default-btn" to="/buy">
                      <Trans>Buy AXN</Trans>
                    </Link>
                    </>
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
                    value ={`${formatKeyAmount(processedData, "stakedEsAxnSupply", 18, 0, true)} AXN ($${formatKeyAmount(processedData, "stakedEsAxnSupplyUsd", USD_DECIMALS, 0, true)})`}
                    direction="align-right"  className="page-row-content-deverse"/>
                  <PageRow title="Total Supply"
                    value ={`${formatAmount(esAxnSupply, 18, 0, true)} AXN ($${formatAmount(esAxnSupplyUsd, USD_DECIMALS, 0, true)})`}
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
                    value ={`${formatAmount(totalAxnStaked, 18, 0, true)} esAXN ($${formatAmount(stakedAxnSupplyUsd, USD_DECIMALS, 0, true)})`}
                    direction="align-right"  className="page-row-content-deverse"/>
                  <PageRow title="Total Supply"
                    value ={`${formatAmount(totalAxnSupply, 18, 0, true)} esAXN ($${formatAmount(totalSupplyUsd, USD_DECIMALS, 0, true)})`}
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
