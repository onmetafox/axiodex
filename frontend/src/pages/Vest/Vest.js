import { useWeb3React } from "@web3-react/core";
import React, { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import useSWR from "swr";
import { ethers } from "ethers";

import moneyIcon from "img/ic_money.svg";
import { Trans, t } from "@lingui/macro";

import "./Vest.css";

import SEO from "components/Common/SEO";
import Modal from "components/Modal/Modal";
import Tooltip from "components/Tooltip/Tooltip";
import PageRow from "components/PageComponent/PageRow";
import PageTitle from "components/PageComponent/PageTitle";
import ExternalLink from "components/ExternalLink/ExternalLink";
import StatsTooltipRow from "components/StatsTooltip/StatsTooltipRow";

import Token from "abis/Token.json";
import Vault from "abis/Vault.json";
import Vester from "abis/Vester.json";
import ReaderV2 from "abis/ReaderV2.json";
import AlpManager from "abis/GlpManager.json";
import RewardReader from "abis/RewardReader.json";

import {
  USD_DECIMALS,
  PLACEHOLDER_ACCOUNT,
  getBalanceAndSupplyData,
  getDepositBalanceData,
  getVestingData,
  getStakingData,
  getProcessedData,
  getPageTitle,
} from "lib/legacy";
import { useChainId } from "lib/chains";
import { helperToast } from "lib/helperToast";
import { contractFetcher, callContract } from "lib/contracts";
import { bigNumberify, expandDecimals, formatAmount, formatAmountFree, formatKeyAmount, parseValue } from "lib/numbers";

import { useAxnPrice, useTotalAxnStaked, useTotalAxnSupply } from "domain/legacy";

import { getConstant } from "config/chains";
import { getContract } from "config/contracts";
// import { getServerUrl } from "config/backend";

const PAGE_TITLE = "Vest";
const DESCRIPTION = ["Convert esAXN tokens to AXN tokens.","Prior to using the vaults, please review the vesting details carefully."];

function VesterDepositModal(props) {
  const {
    isVisible,
    setIsVisible,
    chainId,
    title,
    maxAmount,
    value,
    setValue,
    balance,
    vestedAmount,
    averageStakedAmount,
    maxVestableAmount,
    library,
    stakeTokenLabel,
    reserveAmount,
    maxReserveAmount,
    vesterAddress,
    setPendingTxns,
  } = props;
  const [isDepositing, setIsDepositing] = useState(false);

  let amount = parseValue(value, 18);

  let nextReserveAmount = reserveAmount;

  let nextDepositAmount = vestedAmount;
  if (amount) {
    nextDepositAmount = vestedAmount.add(amount);
  }

  let additionalReserveAmount = bigNumberify(0);
  if (amount && averageStakedAmount && maxVestableAmount && maxVestableAmount.gt(0)) {
    nextReserveAmount = nextDepositAmount.mul(averageStakedAmount).div(maxVestableAmount);
    if (nextReserveAmount.gt(reserveAmount)) {
      additionalReserveAmount = nextReserveAmount.sub(reserveAmount);
    }
  }

  const getError = () => {
    if (!amount || amount.eq(0)) {
      return t`Enter an amount`;
    }
    if (maxAmount && amount.gt(maxAmount)) {
      return t`Max amount exceeded`;
    }
    if (nextReserveAmount.gt(maxReserveAmount)) {
      return t`Insufficient staked tokens`;
    }
  };

  const onClickPrimary = () => {
    setIsDepositing(true);
    const contract = new ethers.Contract(vesterAddress, Vester.abi, library.getSigner());

    callContract(chainId, contract, "deposit", [amount], {
      sentMsg: t`Deposit submitted!`,
      failMsg: t`Deposit failed!`,
      successMsg: t`Deposited!`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsDepositing(false);
      });
  };

  const isPrimaryEnabled = () => {
    const error = getError();
    if (error) {
      return false;
    }
    if (isDepositing) {
      return false;
    }
    return true;
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (isDepositing) {
      return t`Depositing...`;
    }
    return t`Deposit`;
  };

  return (
    <SEO title={getPageTitle("Earn")}>
      <div className="StakeModal">
        <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title} className="non-scrollable">
          <div className="Exchange-swap-section">
            <div className="Exchange-swap-section-top">
              <div className="muted">
                <div className="Exchange-swap-usd">
                  <Trans>Deposit</Trans>
                </div>
              </div>
              <div
                className="muted align-right clickable"
                onClick={() => setValue(formatAmountFree(maxAmount, 18, 18))}
              >
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
              <div className="PositionEditor-token-symbol">esAXN</div>
            </div>
          </div>
          <div className="VesterDepositModal-info-rows">
            <div className="Exchange-info-row">
              <div className="Exchange-info-label">
                <Trans>Wallet</Trans>
              </div>
              <div className="align-right">{formatAmount(balance, 18, 2, true)} esAXN</div>
            </div>
            <div className="Exchange-info-row">
              <div className="Exchange-info-label">
                <Trans>Vault Capacity</Trans>
              </div>
              <div className="align-right">
                <Tooltip
                  handle={`${formatAmount(nextDepositAmount, 18, 2, true)} / ${formatAmount(
                    maxVestableAmount,
                    18,
                    2,
                    true
                  )}`}
                  position="right-bottom"
                  renderContent={() => {
                    return (
                      <div>
                        <p className="text-white">
                          <Trans>Vault Capacity for your Account:</Trans>
                        </p>
                        <StatsTooltipRow
                          showDollar={false}
                          label={t`Deposited`}
                          value={`${formatAmount(vestedAmount, 18, 2, true)} esAXN`}
                        />
                        <StatsTooltipRow
                          showDollar={false}
                          label={t`Max Capacity`}
                          value={`${formatAmount(maxVestableAmount, 18, 2, true)} esAXN`}
                        />
                      </div>
                    );
                  }}
                />
              </div>
            </div>
            <div className="Exchange-info-row">
              <div className="Exchange-info-label">
                <Trans>Reserve Amount</Trans>
              </div>
              <div className="align-right">
                <Tooltip
                  handle={`${formatAmount(
                    reserveAmount && reserveAmount.gte(additionalReserveAmount)
                      ? reserveAmount
                      : additionalReserveAmount,
                    18,
                    2,
                    true
                  )} / ${formatAmount(maxReserveAmount, 18, 2, true)}`}
                  position="right-bottom"
                  renderContent={() => {
                    return (
                      <>
                        <StatsTooltipRow
                          label={t`Current Reserved`}
                          value={formatAmount(reserveAmount, 18, 2, true)}
                          showDollar={false}
                        />
                        <StatsTooltipRow
                          label={t`Additional reserve required`}
                          value={formatAmount(additionalReserveAmount, 18, 2, true)}
                          showDollar={false}
                        />
                        {amount && nextReserveAmount.gt(maxReserveAmount) && (
                          <>
                            <br />
                            <Trans>
                              You need a total of at least {formatAmount(nextReserveAmount, 18, 2, true)}{" "}
                              {stakeTokenLabel} to vest {formatAmount(amount, 18, 2, true)} esAXN.
                            </Trans>
                          </>
                        )}
                      </>
                    );
                  }}
                />
              </div>
            </div>
          </div>
          <div className="Exchange-swap-button-container">
            <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={!isPrimaryEnabled()}>
              {getPrimaryText()}
            </button>
          </div>
        </Modal>
      </div>
    </SEO>
  );
}

function VesterWithdrawModal(props) {
  const { isVisible, setIsVisible, chainId, title, library, vesterAddress, setPendingTxns } = props;
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const onClickPrimary = () => {
    setIsWithdrawing(true);
    const contract = new ethers.Contract(vesterAddress, Vester.abi, library.getSigner());

    callContract(chainId, contract, "withdraw", [], {
      sentMsg: t`Withdraw submitted.`,
      failMsg: t`Withdraw failed.`,
      successMsg: t`Withdrawn!`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsWithdrawing(false);
      });
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title}>
        <Trans>
          <div>
            This will withdraw and unreserve all tokens as well as pause vesting.
            <br />
            <br />
            esAXN tokens that have been converted to AXN will remain as AXN tokens.
            <br />
            <br />
            To claim AXN tokens without withdrawing, use the "Claim" button under the Total Rewards section.
            <br />
            <br />
          </div>
        </Trans>
        <div className="Exchange-swap-button-container">
          <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={isWithdrawing}>
            {!isWithdrawing && "Confirm Withdraw"}
            {isWithdrawing && "Confirming..."}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function Vest({setPendingTxns, connectWallet}) {
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();

  const [isVesterDepositModalVisible, setIsVesterDepositModalVisible] = useState(false);
  const [vesterDepositTitle, setVesterDepositTitle] = useState("");
  const [vesterDepositStakeTokenLabel, setVesterDepositStakeTokenLabel] = useState("");
  const [vesterDepositMaxAmount, setVesterDepositMaxAmount] = useState("");
  const [vesterDepositBalance, setVesterDepositBalance] = useState("");
  const [vesterDepositEscrowedBalance, setVesterDepositEscrowedBalance] = useState("");
  const [vesterDepositVestedAmount, setVesterDepositVestedAmount] = useState("");
  const [vesterDepositAverageStakedAmount, setVesterDepositAverageStakedAmount] = useState("");
  const [vesterDepositMaxVestableAmount, setVesterDepositMaxVestableAmount] = useState("");
  const [vesterDepositValue, setVesterDepositValue] = useState("");
  const [vesterDepositReserveAmount, setVesterDepositReserveAmount] = useState("");
  const [vesterDepositMaxReserveAmount, setVesterDepositMaxReserveAmount] = useState("");
  const [vesterDepositAddress, setVesterDepositAddress] = useState("");

  const [isVesterWithdrawModalVisible, setIsVesterWithdrawModalVisible] = useState(false);
  const [vesterWithdrawTitle, setVesterWithdrawTitle] = useState(false);
  const [vesterWithdrawAddress, setVesterWithdrawAddress] = useState("");

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

  let totalRewardTokensAndAlp;
  if (totalRewardTokens && processedData && processedData.alpBalance) {
    totalRewardTokensAndAlp = totalRewardTokens.add(processedData.alpBalance);
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

  const showAxnVesterDepositModal = () => {
    let remainingVestableAmount = vestingData.axnVester.maxVestableAmount.sub(vestingData.axnVester.vestedAmount);
    if (processedData.esAxnBalance.lt(remainingVestableAmount)) {
      remainingVestableAmount = processedData.esAxnBalance;
    }

    setIsVesterDepositModalVisible(true);
    setVesterDepositTitle(t`AXN Vault`);
    setVesterDepositStakeTokenLabel("staked AXN + esAXN + Multiplier Points");
    setVesterDepositMaxAmount(remainingVestableAmount);
    setVesterDepositBalance(processedData.esAxnBalance);
    setVesterDepositEscrowedBalance(vestingData.axnVester.escrowedBalance);
    setVesterDepositVestedAmount(vestingData.axnVester.vestedAmount);
    setVesterDepositMaxVestableAmount(vestingData.axnVester.maxVestableAmount);
    setVesterDepositAverageStakedAmount(vestingData.axnVester.averageStakedAmount);
    setVesterDepositReserveAmount(vestingData.axnVester.pairAmount);
    setVesterDepositMaxReserveAmount(totalRewardTokens);
    setVesterDepositValue("");
    setVesterDepositAddress(axnVesterAddress);
  };

  const showAxnVesterWithdrawModal = () => {
    if (!vestingData || !vestingData.axnVesterVestedAmount || vestingData.axnVesterVestedAmount.eq(0)) {
      helperToast.error(t`You have not deposited any tokens for vesting.`);
      return;
    }

    setIsVesterWithdrawModalVisible(true);
    setVesterWithdrawTitle(t`Withdraw from AXN Vault`);
    setVesterWithdrawAddress(axnVesterAddress);
  };

  const showAlpVesterDepositModal = () => {
    let remainingVestableAmount = vestingData.alpVester.maxVestableAmount.sub(vestingData.alpVester.vestedAmount);
    if (processedData.esAxnBalance.lt(remainingVestableAmount)) {
      remainingVestableAmount = processedData.esAxnBalance;
    }

    setIsVesterDepositModalVisible(true);
    setVesterDepositTitle(t`ALP Vault`);
    setVesterDepositStakeTokenLabel("staked TLP");
    setVesterDepositMaxAmount(remainingVestableAmount);
    setVesterDepositBalance(processedData.esAxnBalance);
    setVesterDepositEscrowedBalance(vestingData.alpVester.escrowedBalance);
    setVesterDepositVestedAmount(vestingData.alpVester.vestedAmount);
    setVesterDepositMaxVestableAmount(vestingData.alpVester.maxVestableAmount);
    setVesterDepositAverageStakedAmount(vestingData.alpVester.averageStakedAmount);
    setVesterDepositReserveAmount(vestingData.alpVester.pairAmount);
    setVesterDepositMaxReserveAmount(processedData.alpBalance);
    setVesterDepositValue("");
    setVesterDepositAddress(alpVesterAddress);
  };

  const showAlpVesterWithdrawModal = () => {
    if (!vestingData || !vestingData.alpVesterVestedAmount || vestingData.alpVesterVestedAmount.eq(0)) {
      helperToast.error(t`You have not deposited any tokens for vesting.`);
      return;
    }

    setIsVesterWithdrawModalVisible(true);
    setVesterWithdrawTitle(t`Withdraw from ALP Vault`);
    setVesterWithdrawAddress(alpVesterAddress);
  };

  return (
    <>
      <VesterDepositModal
          isVisible={isVesterDepositModalVisible}
          setIsVisible={setIsVesterDepositModalVisible}
          chainId={chainId}
          title={vesterDepositTitle}
          stakeTokenLabel={vesterDepositStakeTokenLabel}
          maxAmount={vesterDepositMaxAmount}
          balance={vesterDepositBalance}
          escrowedBalance={vesterDepositEscrowedBalance}
          vestedAmount={vesterDepositVestedAmount}
          averageStakedAmount={vesterDepositAverageStakedAmount}
          maxVestableAmount={vesterDepositMaxVestableAmount}
          reserveAmount={vesterDepositReserveAmount}
          maxReserveAmount={vesterDepositMaxReserveAmount}
          value={vesterDepositValue}
          setValue={setVesterDepositValue}
          library={library}
          vesterAddress={vesterDepositAddress}
          setPendingTxns={setPendingTxns}
        />
        <VesterWithdrawModal
          isVisible={isVesterWithdrawModalVisible}
          setIsVisible={setIsVesterWithdrawModalVisible}
          vesterAddress={vesterWithdrawAddress}
          chainId={chainId}
          title={vesterWithdrawTitle}
          library={library}
          setPendingTxns={setPendingTxns}
        />
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
                      <ExternalLink href="https://axnio.gitbook.io/axn/trading#fees">
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
                            <Link to="/overview">
                              <Trans>Claim page</Trans>
                            </Link>
                          </div>
                        </div>
                        <div className="Exchange-swap-section-bottom strategy-content">
                          <div>{`${formatKeyAmount(vestingData, "axnVesterClaimable", 18, 4, true)} AXN`}</div>
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
                        value={`${formatKeyAmount(vestingData, "axnVesterPairAmount", 18, 2, true)} / ${formatAmount(totalRewardTokens, 18, 2, true)}`}
                        direction="align-right" className="page-row-content-deverse"/>
                    </div>
                    <div className="row">
                      <PageRow title= "Vesting Status"
                        value={`${formatKeyAmount(vestingData, "axnVesterClaimSum", 18, 4, true)} / ${formatKeyAmount(vestingData, "axnVesterVestedAmount", 18, 4, true)}`}
                        direction="align-right" className="page-row-content-deverse"/>
                    </div>
                    <div className="row">
                      {active && (
                        <button className="App-button-option App-card-option" onClick={() => showAxnVesterDepositModal()}>
                          <Trans>Deposit</Trans>
                        </button>
                      )}
                      {active && (
                        <button className="App-button-option App-card-option" onClick={() => showAxnVesterWithdrawModal()}>
                          <Trans>Widthraw</Trans>
                        </button>
                      )}
                      {!active && (
                        <button className="App-button-option App-card-option" onClick={() => connectWallet()}>
                          Connect Wallet
                        </button>
                      )}
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
                      <ExternalLink href="https://axnio.gitbook.io/axn/trading#fees">
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
                            <Link to="/overview">
                              <Trans>Claim page</Trans>
                            </Link>
                          </div>
                        </div>
                        <div className="Exchange-swap-section-bottom strategy-content">
                          <div>{`${formatKeyAmount(vestingData, "alpVesterClaimable", 18, 4, true)} AXN`}</div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <PageRow title= "Stake Tokens"
                        value={`${formatAmount(processedData.alpBalance, 18, 2, true)} ALP`}
                        direction="align-right" className="page-row-content-deverse"/>
                    </div>
                    <div className="row">
                      <PageRow title= "Reserved for Vesting"
                        value={`${formatKeyAmount(vestingData, "alpVesterPairAmount", 18, 2, true)} / ${formatAmount(processedData.alpBalance, 18, 2, true)}`}
                        direction="align-right" className="page-row-content-deverse"/>
                    </div>
                    <div className="row">
                      <PageRow title= "Vesting Status"
                        value={`${formatKeyAmount(vestingData, "alpVesterClaimSum", 18, 4, true)} / ${formatKeyAmount( vestingData, "alpVesterVestedAmount", 18, 4, true)}`}
                        direction="align-right" className="page-row-content-deverse"/>
                    </div>
                    <div className="row">
                      {active && (
                        <button className="App-button-option App-card-option" onClick={() => showAlpVesterDepositModal()}>
                          <Trans>Deposit</Trans>
                        </button>
                      )}
                      {active && (
                        <button className="App-button-option App-card-option" onClick={() => showAlpVesterWithdrawModal()}>
                          <Trans>Widthraw</Trans>
                        </button>
                      )}
                      {!active && (
                        <button className="App-button-option App-card-option" onClick={() => connectWallet()}>
                          Connect Wallet
                        </button>
                      )}
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
