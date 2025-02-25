import React, { useState } from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

import { getContract } from "config/contracts";

import Modal from "components/Modal/Modal";
import Footer from "components/Footer/Footer";
import PageTitle from "components/PageComponent/PageTitle";

import Token from "abis/Token.json";
import Vester from "abis/Vester.json";
import RewardTracker from "abis/RewardTracker.json";
import RewardRouter from "abis/RewardRouter.json";

import { FaCheck, FaTimes } from "react-icons/fa";

import { Trans, t } from "@lingui/macro";

import "./BeginAccountTransfer.css";
import { callContract, contractFetcher } from "lib/contracts";
import { approveTokens } from "domain/tokens";
import { useChainId } from "lib/chains";

const PAGE_TITLE = "Transfer Account";
const DESCRIPTION = [
  "Please note that this transfer method is intended for full account transfers only. The following rules apply",
  "- This transfer will move all your AXN, esAXN, ALP, and Multiplier Points to your new account.",
  "- Transfers are only supported if the receiving account has not staked AXN`1 or ALP tokens before.",
  "- This transfer is one-way only, meaning you will not be able to transfer staked tokens back to the sending account."
]

function ValidationRow({ isValid, children }) {
  return (
    <div className="ValidationRow">
      <div className="ValidationRow-icon-container">
        {isValid && <FaCheck className="ValidationRow-icon" />}
        {!isValid && <FaTimes className="ValidationRow-icon" />}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function BeginAccountTransfer(props) {
  const { setPendingTxns } = props;
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();

  const [receiver, setReceiver] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isTransferSubmittedModalVisible, setIsTransferSubmittedModalVisible] = useState(false);
  let parsedReceiver = ethers.constants.AddressZero;
  if (ethers.utils.isAddress(receiver)) {
    parsedReceiver = receiver;
  }

  const gmxAddress = getContract("AXN");
  const gmxVesterAddress = getContract("AxnVester");
  const glpVesterAddress = getContract("AlpVester");

  const rewardRouterAddress = getContract("RewardRouter");

  const { data: gmxVesterBalance } = useSWR(active && [active, chainId, gmxVesterAddress, "balanceOf", account], {
    fetcher: contractFetcher(library, Token),
  });

  const { data: glpVesterBalance } = useSWR(active && [active, chainId, glpVesterAddress, "balanceOf", account], {
    fetcher: contractFetcher(library, Token),
  });

  const stakedGmxTrackerAddress = getContract("StakedAxnTracker");
  const { data: cumulativeGmxRewards } = useSWR(
    [active, chainId, stakedGmxTrackerAddress, "cumulativeRewards", parsedReceiver],
    {
      fetcher: contractFetcher(library, RewardTracker),
    }
  );

  const stakedGlpTrackerAddress = getContract("StakedAlpTracker");
  const { data: cumulativeGlpRewards } = useSWR(
    [active, chainId, stakedGlpTrackerAddress, "cumulativeRewards", parsedReceiver],
    {
      fetcher: contractFetcher(library, RewardTracker),
    }
  );

  const { data: transferredCumulativeGmxRewards } = useSWR(
    [active, chainId, gmxVesterAddress, "transferredCumulativeRewards", parsedReceiver],
    {
      fetcher: contractFetcher(library, Vester),
    }
  );

  const { data: transferredCumulativeGlpRewards } = useSWR(
    [active, chainId, glpVesterAddress, "transferredCumulativeRewards", parsedReceiver],
    {
      fetcher: contractFetcher(library, Vester),
    }
  );

  const { data: pendingReceiver } = useSWR(
    active && [active, chainId, rewardRouterAddress, "pendingReceivers", account],
    {
      fetcher: contractFetcher(library, RewardRouter),
    }
  );

  const { data: gmxAllowance } = useSWR(
    active && [active, chainId, gmxAddress, "allowance", account, stakedGmxTrackerAddress],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  const { data: gmxStaked } = useSWR(
    active && [active, chainId, stakedGmxTrackerAddress, "depositBalances", account, gmxAddress],
    {
      fetcher: contractFetcher(library, RewardTracker),
    }
  );

  const needApproval = gmxAllowance && gmxStaked && gmxStaked.gt(gmxAllowance);

  const hasVestedGmx = gmxVesterBalance && gmxVesterBalance.gt(0);
  const hasVestedGlp = glpVesterBalance && glpVesterBalance.gt(0);
  const hasStakedGmx =
    (cumulativeGmxRewards && cumulativeGmxRewards.gt(0)) ||
    (transferredCumulativeGmxRewards && transferredCumulativeGmxRewards.gt(0));
  const hasStakedGlp =
    (cumulativeGlpRewards && cumulativeGlpRewards.gt(0)) ||
    (transferredCumulativeGlpRewards && transferredCumulativeGlpRewards.gt(0));
  const hasPendingReceiver = pendingReceiver && pendingReceiver !== ethers.constants.AddressZero;

  const getError = () => {
    if (!account) {
      return t`Wallet is not connected`;
    }
    if (hasVestedGmx) {
      return t`Vested AXN not withdrawn`;
    }
    if (hasVestedGlp) {
      return t`Vested ALP not withdrawn`;
    }
    if (!receiver || receiver.length === 0) {
      return t`Enter Receiver Address`;
    }
    if (!ethers.utils.isAddress(receiver)) {
      return t`Invalid Receiver Address`;
    }
    if (hasStakedGmx || hasStakedGlp) {
      return t`Invalid Receiver`;
    }
    if ((parsedReceiver || "").toString().toLowerCase() === (account || "").toString().toLowerCase()) {
      return t`Self-transfer not supported`;
    }

    if (
      (parsedReceiver || "").length > 0 &&
      (parsedReceiver || "").toString().toLowerCase() === (pendingReceiver || "").toString().toLowerCase()
    ) {
      return t`Transfer already initiated`;
    }
  };

  const isPrimaryEnabled = () => {
    const error = getError();
    if (error) {
      return false;
    }
    if (isApproving) {
      return false;
    }
    if (isTransferring) {
      return false;
    }
    return true;
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (needApproval) {
      return t`Approve AXN`;
    }
    if (isApproving) {
      return t`Approving...`;
    }
    if (isTransferring) {
      return t`Transferring`;
    }

    return t`Begin Transfer`;
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

    setIsTransferring(true);
    const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());

    callContract(chainId, contract, "signalTransfer", [parsedReceiver], {
      sentMsg: t`Transfer submitted!`,
      failMsg: t`Transfer failed.`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsTransferSubmittedModalVisible(true);
      })
      .finally(() => {
        setIsTransferring(false);
      });
  };

  const completeTransferLink = `/complete_account_transfer/${account}/${parsedReceiver}`;
  const pendingTransferLink = `/complete_account_transfer/${account}/${pendingReceiver}`;

  const PAGE_TITLE = "Transfer Account";
  const DESCRIPTION = [
    "Please note that this transfer method is intended for full account transfers only. The following rules apply",
    "- This transfer will move all your AXN, esAXN, ALP, and Multiplier Points to your new account.",
    "- Transfers are only supported if the receiving account has not staked AXN or ALP tokens before.",
    "- This transfer is one-way only, meaning you will not be able to transfer staked tokens back to the sending account."
  ]
  return (
    <div className="BeginAccountTransfer page-layout">
      <Modal
        isVisible={isTransferSubmittedModalVisible}
        setIsVisible={setIsTransferSubmittedModalVisible}
        label={t`Transfer Submitted`}
      >
        <Trans>Your transfer has been initiated.</Trans>
        <br />
        <br />
        <Link className="App-cta" to={completeTransferLink}>
          <Trans>Continue</Trans>
        </Link>
      </Modal>
      <PageTitle title = {PAGE_TITLE} descriptions = {DESCRIPTION} />
      {hasPendingReceiver && (
        <div className="Page-description">
          <Trans>
            You have a <Link to={pendingTransferLink}>pending transfer</Link> to {pendingReceiver}.
          </Trans>
        </div>
      )}
      <div className="Page-content">
        <div className="input-form">
          <div className="input-row">
            <label className="input-label">
              <Trans>Receiver Address</Trans>
            </label>
            <div>
              <input
                type="text"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="text-input"
                placeholder= "Enter Address"
              />
            </div>
          </div>
          <div className="BeginAccountTransfer-validations">
            <ValidationRow isValid={!hasVestedGmx}>
              <Trans>Sender has withdrawn all tokens from AXN Vesting Vault</Trans>
            </ValidationRow>
            <ValidationRow isValid={!hasVestedGlp}>
              <Trans>Sender has withdrawn all tokens from ALP Vesting Vault</Trans>
            </ValidationRow>
            <ValidationRow isValid={!hasStakedGmx}>
              <Trans>Receiver has not staked AXN tokens before</Trans>
            </ValidationRow>
            <ValidationRow isValid={!hasStakedGlp}>
              <Trans>Receiver has not staked ALP tokens before</Trans>
            </ValidationRow>
          </div>
          <div className="input-row">
            <button
              className="App-cta Exchange-swap-button"
              disabled={!isPrimaryEnabled()}
              onClick={() => onClickPrimary()}
            >
              {getPrimaryText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
