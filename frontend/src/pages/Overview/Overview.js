import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { Trans, t } from "@lingui/macro";

import iconOview from "img/ic_overview.svg";
import "./Overview.css";
import PageTitle from "components/PageComponent/PageTitle";
import PageRow from "components/PageComponent/PageRow";
import ImgIcon from "components/IconComponent/ImgIcon";
import Button from "components/Button/Button";
import ExternalLink from "components/ExternalLink/ExternalLink";
import Modal from "components/Modal/Modal";
import Checkbox from "components/Checkbox/Checkbox";

import useSWR from "swr";
import { useChainId } from "lib/chains";
import { contractFetcher, callContract } from "lib/contracts";
import { useLocalStorageSerializeKey } from "lib/localStorage";
import { bigNumberify, expandDecimals, formatAmount, formatAmountFree, formatKeyAmount, parseValue } from "lib/numbers";
import { getContract } from "config/contracts";
import { DEFAULT_CHAIN_ID, getChainName, getConstant } from "config/chains";
import { useAxnPrice, useTotalAxnStaked, useTotalAxnSupply } from "domain/legacy";
import { approveTokens } from "domain/tokens";

import Vault from "abis/Vault.json";
import ReaderV2 from "abis/ReaderV2.json";
import RewardRouter from "abis/RewardRouter.json";
import RewardReader from "abis/RewardReader.json";
import Token from "abis/Token.json";
import AlpManager from "abis/GlpManager.json";

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
const DESCRIPTION = ["By staking AXN or ALP tokens to the Base network, You can earn Protocol income and Rewards."];
const REWARDS = "Total Rewards";

const VEST_WITH_GMX_ARB = "VEST_WITH_GMX_ARB";
const VEST_WITH_GLP_ARB = "VEST_WITH_GLP_ARB";
const VEST_WITH_GMX_AVAX = "VEST_WITH_GMX_AVAX";
const VEST_WITH_GLP_AVAX = "VEST_WITH_GLP_AVAX";

export default function Overview({ setPendingTxns, connectWallet }) {
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();
  const [selectedOption, setSelectedOption] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [value, setValue] = useState("");

  const isOnChain = chainId === DEFAULT_CHAIN_ID;

  const rewardRouterAddress = getContract("RewardRouter");
  const rewardReaderAddress = getContract("RewardReader");
  const readerAddress = getContract("Reader");

  const vaultAddress = getContract("Vault");
  const nativeTokenAddress = getContract("NATIVE_TOKEN");
  const axnAddress = getContract("AXN");
  const esAxnAddress = getContract("EsAXN");
  const bnAxnAddress = getContract("BnAXN");
  const alpAddress = getContract("ALP");
  const esAxnIouAddress = getContract("EsAxnIOU");

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

  const [isCompoundModalVisible, setIsCompoundModalVisible] = useState(false);
  const [isClaimModalVisible, setIsClaimModalVisible] = useState(false);
  const [claimModalTitle, setClaimModalTitle] = useState("");

  // const [stakeModalMaxAmount, setClaimModalMaxAmount] = useState(undefined);
  // const [stakeValue, setStakeValue] = useState("");
  // const [stakingTokenSymbol, setStakingTokenSymbol] = useState("");
  // const [stakingTokenAddress, setStakingTokenAddress] = useState("");
  // const [stakingFarmAddress, setStakingFarmAddress] = useState("");
  // const [stakeMethodName, setStakeMethodName] = useState("");

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

  const { data: esGmxIouBalance } = useSWR(
    [`ClaimEsGmx:esGmxIouBalance:${active}`, chainId, esAxnIouAddress, "balanceOf", account || PLACEHOLDER_ACCOUNT],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  const { axnPrice } = useAxnPrice(chainId, library, active);

  // Get total supply of arbitrum and avalanche
  let { total: totalAxnSupply } = useTotalAxnSupply(chainId);

  let { total: totalAxnStaked } = useTotalAxnStaked();

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

  let amount = parseValue(value, 18);

  const getError = () => {
    if (!active) {
      return `Wallet not connected`;
    }

    if (esGmxIouBalance && esGmxIouBalance.eq(0)) {
      return `No esAXN to claim`;
    }

    if (!amount || amount.eq(0)) {
      return `Enter an amount`;
    }

    if (selectedOption === "") {
      return `Select an option`;
    }

    return false;
  };

  const error = getError();

  const AxnAndesAxnStaked = processedData.axnInStakedAxn?.add(processedData.esAxnInStakedAxn);
  const AxnAndesAxnStakedUsd = processedData.axnInStakedAxnUsd?.add(processedData.esAxnInStakedAxnUsd);

  const getPrimaryText = () => {
    if (error) {
      return error;
    }

    if (isClaiming) {
      return `Claiming...`;
    }

    return `Claim`;
  };

  function CompoundModal(props) {
    const {
      isVisible,
      setIsVisible,
      rewardRouterAddress,
      active,
      account,
      library,
      chainId,
      setPendingTxns,
      totalVesterRewards,
      nativeTokenSymbol,
      wrappedTokenSymbol,
    } = props;
    const [isCompounding, setIsCompounding] = useState(false);
    const [shouldClaimGmx, setShouldClaimGmx] = useLocalStorageSerializeKey(
      [chainId, "StakeV2-compound-should-claim-gmx"],
      true
    );
    const [shouldStakeGmx, setShouldStakeGmx] = useLocalStorageSerializeKey(
      [chainId, "StakeV2-compound-should-stake-gmx"],
      true
    );
    const [shouldClaimEsGmx, setShouldClaimEsGmx] = useLocalStorageSerializeKey(
      [chainId, "StakeV2-compound-should-claim-es-gmx"],
      true
    );
    const [shouldStakeEsGmx, setShouldStakeEsGmx] = useLocalStorageSerializeKey(
      [chainId, "StakeV2-compound-should-stake-es-gmx"],
      true
    );
    const [shouldStakeMultiplierPoints, setShouldStakeMultiplierPoints] = useState(true);
    const [shouldClaimWeth, setShouldClaimWeth] = useLocalStorageSerializeKey(
      [chainId, "StakeV2-compound-should-claim-weth"],
      true
    );
    const [shouldConvertWeth, setShouldConvertWeth] = useLocalStorageSerializeKey(
      [chainId, "StakeV2-compound-should-convert-weth"],
      true
    );

    const gmxAddress = getContract("AXN");
    const stakedGmxTrackerAddress = getContract("StakedAxnTracker");

    const [isApproving, setIsApproving] = useState(false);

    const { data: tokenAllowance } = useSWR(
      active && [active, chainId, gmxAddress, "allowance", account, stakedGmxTrackerAddress],
      {
        fetcher: contractFetcher(library, Token),
      }
    );

    const needApproval =
      shouldStakeGmx && tokenAllowance && totalVesterRewards && totalVesterRewards.gt(tokenAllowance);

    const isPrimaryEnabled = () => {
      return !isCompounding && !isApproving && !isCompounding;
    };

    const getPrimaryText = () => {
      if (isApproving) {
        return t`Approving AXN...`;
      }
      if (needApproval) {
        return t`Approve AXN`;
      }
      if (isCompounding) {
        return t`Compounding...`;
      }
      return t`Compound`;
    };

    const onClickPrimary = () => {
      if (needApproval) {
        approveTokens({
          setIsApproving,
          library,
          tokenAddress: gmxAddress,
          spender: stakedGmxTrackerAddress,
          chainId,
        });
        return;
      }

      setIsCompounding(true);

      const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());
      callContract(
        chainId,
        contract,
        "handleRewards",
        [
          shouldClaimGmx || shouldStakeGmx,
          shouldStakeGmx,
          shouldClaimEsGmx || shouldStakeEsGmx,
          shouldStakeEsGmx,
          shouldStakeMultiplierPoints,
          shouldClaimWeth || shouldConvertWeth,
          shouldConvertWeth,
        ],
        {
          sentMsg: t`Compound submitted!`,
          failMsg: t`Compound failed.`,
          successMsg: t`Compound completed!`,
          setPendingTxns,
        }
      )
        .then(async (res) => {
          setIsVisible(false);
        })
        .finally(() => {
          setIsCompounding(false);
        });
    };

    const toggleShouldStakeGmx = (value) => {
      if (value) {
        setShouldClaimGmx(true);
      }
      setShouldStakeGmx(value);
    };

    const toggleShouldStakeEsGmx = (value) => {
      if (value) {
        setShouldClaimEsGmx(true);
      }
      setShouldStakeEsGmx(value);
    };

    const toggleConvertWeth = (value) => {
      if (value) {
        setShouldClaimWeth(true);
      }
      setShouldConvertWeth(value);
    };

    return (
      <div className="StakeModal">
        <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={t`Compound Rewards`}>
          <div className="CompoundModal-menu">
            <div>
              <Checkbox
                isChecked={shouldStakeMultiplierPoints}
                setIsChecked={setShouldStakeMultiplierPoints}
                disabled={true}
              >
                <Trans>Stake Multiplier Points</Trans>
              </Checkbox>
            </div>
            <div>
              <Checkbox isChecked={shouldClaimGmx} setIsChecked={setShouldClaimGmx} disabled={shouldStakeGmx}>
                <Trans>Claim AXN Rewards</Trans>
              </Checkbox>
            </div>
            <div>
              <Checkbox isChecked={shouldStakeGmx} setIsChecked={toggleShouldStakeGmx}>
                <Trans>Stake AXN Rewards</Trans>
              </Checkbox>
            </div>
            <div>
              <Checkbox isChecked={shouldClaimEsGmx} setIsChecked={setShouldClaimEsGmx} disabled={shouldStakeEsGmx}>
                <Trans>Claim esAXN Rewards</Trans>
              </Checkbox>
            </div>
            <div>
              <Checkbox isChecked={shouldStakeEsGmx} setIsChecked={toggleShouldStakeEsGmx}>
                <Trans>Stake esAXN Rewards</Trans>
              </Checkbox>
            </div>
            <div>
              <Checkbox isChecked={shouldClaimWeth} setIsChecked={setShouldClaimWeth} disabled={shouldConvertWeth}>
                <Trans>Claim {wrappedTokenSymbol} Rewards</Trans>
              </Checkbox>
            </div>
            <div>
              <Checkbox isChecked={shouldConvertWeth} setIsChecked={toggleConvertWeth}>
                <Trans>
                  Convert {wrappedTokenSymbol} to {nativeTokenSymbol}
                </Trans>
              </Checkbox>
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

  function ClaimModal(props) {
    const {
      isVisible,
      setIsVisible,
      rewardRouterAddress,
      library,
      chainId,
      setPendingTxns,
      nativeTokenSymbol,
      wrappedTokenSymbol,
    } = props;
    const [isClaiming, setIsClaiming] = useState(false);
    const [shouldClaimGmx, setShouldClaimGmx] = useLocalStorageSerializeKey(
      [chainId, "StakeV2-claim-should-claim-gmx"],
      true
    );
    const [shouldClaimEsGmx, setShouldClaimEsGmx] = useLocalStorageSerializeKey(
      [chainId, "StakeV2-claim-should-claim-es-gmx"],
      true
    );
    const [shouldClaimWeth, setShouldClaimWeth] = useLocalStorageSerializeKey(
      [chainId, "StakeV2-claim-should-claim-weth"],
      true
    );
    const [shouldConvertWeth, setShouldConvertWeth] = useLocalStorageSerializeKey(
      [chainId, "StakeV2-claim-should-convert-weth"],
      true
    );

    const isPrimaryEnabled = () => {
      return !isClaiming;
    };

    const getPrimaryText = () => {
      if (isClaiming) {
        return `Claiming...`;
      }
      return `Claim`;
    };

    const onClickPrimary = () => {
      setIsClaiming(true);

      const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());
      callContract(
        chainId,
        contract,
        "handleRewards",
        [
          shouldClaimGmx,
          false, // shouldStakeGmx
          shouldClaimEsGmx,
          false, // shouldStakeEsGmx
          false, // shouldStakeMultiplierPoints
          shouldClaimWeth,
          shouldConvertWeth,
        ],
        {
          sentMsg: `Claim submitted.`,
          failMsg: `Claim failed.`,
          successMsg: `Claim completed!`,
          setPendingTxns,
        }
      )
        .then(async (res) => {
          setIsVisible(false);
        })
        .finally(() => {
          setIsClaiming(false);
        });
    };

    const toggleConvertWeth = (value) => {
      if (value) {
        setShouldClaimWeth(true);
      }
      setShouldConvertWeth(value);
    };

    return (
      <div className="StakeModal">
        <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={`Claim Rewards`}>
          <div className="CompoundModal-menu">
            <div>
              <Checkbox isChecked={shouldClaimGmx} setIsChecked={setShouldClaimGmx}>
                <Trans>Claim AXN Rewards</Trans>
              </Checkbox>
            </div>
            <div>
              <Checkbox isChecked={shouldClaimEsGmx} setIsChecked={setShouldClaimEsGmx}>
                <Trans>Claim esAXN Rewards</Trans>
              </Checkbox>
            </div>
            <div>
              <Checkbox isChecked={shouldClaimWeth} setIsChecked={setShouldClaimWeth} disabled={shouldConvertWeth}>
                <Trans>Claim {wrappedTokenSymbol} Rewards</Trans>
              </Checkbox>
            </div>
            <div>
              <Checkbox isChecked={shouldConvertWeth} setIsChecked={toggleConvertWeth}>
                <Trans>
                  Convert {wrappedTokenSymbol} to {nativeTokenSymbol}
                </Trans>
              </Checkbox>
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

  return (
    <>
      <CompoundModal
        active={active}
        account={account}
        setPendingTxns={setPendingTxns}
        isVisible={isCompoundModalVisible}
        setIsVisible={setIsCompoundModalVisible}
        rewardRouterAddress={rewardRouterAddress}
        totalVesterRewards={processedData.totalVesterRewards}
        wrappedTokenSymbol={wrappedTokenSymbol}
        nativeTokenSymbol={nativeTokenSymbol}
        library={library}
        chainId={chainId}
      />
      <ClaimModal
        active={active}
        account={account}
        setPendingTxns={setPendingTxns}
        isVisible={isClaimModalVisible}
        setIsVisible={setIsClaimModalVisible}
        rewardRouterAddress={rewardRouterAddress}
        totalVesterRewards={processedData.totalVesterRewards}
        wrappedTokenSymbol={wrappedTokenSymbol}
        nativeTokenSymbol={nativeTokenSymbol}
        library={library}
        chainId={chainId}
      />
      <div className="overview page-layout">
        <div className="Page-content overview">
          <div className="row">
            <div className="Page-title">{PAGE_TITLE}</div>
            <div className="Page-description">
              <div className="row">
                <p>{DESCRIPTION} <a href="https://docs.axiodex.com/tokenomics/rewards-summary">Learn More</a></p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12 col-sm-12 col-md-12 ">
              <div className="row padding-1r">
                <div className="col-lg-8 col-sm-12 col-md-12 m-auto">
                  <div className="Exchange-swap-section strategy-container colored border-0">
                    <div className="Exchange-swap-section-top row">
                      <div className="strategy-title col-6">{REWARDS}</div>
                    </div>
                    <div classN1ame="row padding-1r">
                      <div className="total-rewards">{`$${formatKeyAmount(processedData, "totalRewardsUsd", USD_DECIMALS, 2, true)}`}</div>
                    </div>
                    <PageRow
                      title={`${nativeTokenSymbol} ( ${wrappedTokenSymbol})`}
                      value={`${formatKeyAmount(processedData, "totalNativeTokenRewards", 18, 4, true)}`}
                      subValue={`$${formatKeyAmount(processedData, "totalNativeTokenRewardsUsd", USD_DECIMALS, 2, true)}`}
                      direction="align-right"
                      className="table-row"
                    />
                    <PageRow
                      title="AXN"
                      value={`${formatKeyAmount(processedData, "totalVesterRewards", 18, 4, true)}`}
                      subValue={`$${formatKeyAmount(processedData, "totalVesterRewardsUsd", USD_DECIMALS, 2, true)}`}
                      direction="align-right"
                      className="table-row"
                    />
                    <PageRow
                      title="esAXN"
                      value={`${formatKeyAmount(processedData, "totalEsAxnRewards", 18, 4, true)}`}
                      subValue={`$${formatKeyAmount(processedData, "totalEsAxnRewardsUsd", USD_DECIMALS, 2, true)}`}
                      direction="align-right"
                      className="table-row"
                    />
                    <PageRow
                      title="Multiplier Points"
                      value={formatKeyAmount(processedData, "bonusAxnTrackerRewards", 18, 4, true)}
                      direction="align-right"
                      className="table-row"
                    />
                    <PageRow
                      title="Staked Multiplier Points"
                      value={formatKeyAmount(processedData, "bnAxnInFeeAxn", 18, 4, true)}
                      direction="align-right"
                      className="table-row"
                    />
                    <div className="row padding-1r">
                      {!active ? (
                        <button className="App-cta Exchange-swap-button" onClick={() => connectWallet()}>
                          <Trans>Connect Wallet</Trans>
                        </button>
                      ) : (
                        <div style={{ display: "flex", justifyContent: "around", alignItems: "center" }}>
                          <button className="default-btn" onClick={() => setIsCompoundModalVisible(true)}>
                            <Trans>Compound</Trans>
                          </button>
                          <button className="default-btn" onClick={() => setIsClaimModalVisible(true)}>
                            <Trans>Claim</Trans>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12 col-sm-12 col-md-12 text-align-btn padding-1r">
              <div className="row padding-1r">
                <div className="col-6 col-lg-6 col-md-6 col-sm-12  padding-1r">
                  <div className="row">
                    <div className="Exchange-swap-section strategy-container">
                      <div className="row">
                        <div className="col-5">
                          <PageRow
                            title="AXN & esAXN staked"
                            value={`${formatAmount(AxnAndesAxnStaked, 18, 2, true)}`}
                            subValue={`$${formatAmount(AxnAndesAxnStakedUsd, USD_DECIMALS, 2, true)}`}
                            direction="vertical"
                          />
                        </div>
                        <div className="col-3">
                          <PageRow title="APR" value="50.16%" direction="vertical" />
                        </div>
                        <div className="col-4">
                          <Button className="strategy-btn" href="/axes">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="Exchange-swap-section strategy-container">
                      <div className="row">
                        <div className="col-5">
                          <PageRow
                            title="ALP staked"
                            value={`${formatKeyAmount(processedData, "alpBalance", TLP_DECIMALS, 2, true)}`}
                            subValue={`$${formatKeyAmount(processedData, "alpBalanceUsd", USD_DECIMALS, 2, true)}`}
                            direction="vertical"
                          />
                        </div>
                        <div className="col-3">
                          <PageRow title="APR" value="133.62%" direction="vertical" />
                        </div>
                        <div className="col-4">
                          <Button className="strategy-btn" href="mlp">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-lg-6 col-md-6 col-sm-12 padding-1r ">
                  <div className="row">
                    <div className="Exchange-swap-section strategy-container">
                      <div className="row">
                        <div className="col-5">
                          <PageRow
                            title="Vesting status"
                            value={`${formatKeyAmount(
                              vestingData,
                              "axnVesterClaimSum",
                              18,
                              4,
                              true
                            )} / ${formatKeyAmount(vestingData, "axnVesterVestedAmount", 18, 4, true)}`}
                            direction="vertical"
                          />
                        </div>
                        <div className="col-3"></div>
                        <div className="col-4">
                          <Button className="strategy-btn" href="vest">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="Exchange-swap-section strategy-container">
                      <div className="row">
                        <div className="col-5">
                          <PageRow title="Deposited in vault" value="$0" direction="vertical" />
                        </div>
                        <div className="col-3"></div>
                        <div className="col-4">
                          <Button className="strategy-btn" href="vault">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
