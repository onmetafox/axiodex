import React from "react";
import { FiX } from "react-icons/fi";
import { Trans } from "@lingui/macro";
import { Link } from "react-router-dom";

import { HeaderLink } from "./HeaderLink";
import "./Header.css";
import { isHomeSite, getHomeUrl } from "lib/legacy";
import ExternalLink from "components/ExternalLink/ExternalLink";
import logoImg from "img/logo_AXN.svg";

type Props = {
  small?: boolean;
  clickCloseIcon?: () => void;
  openSettings?: () => void;
  redirectPopupTimestamp: number;
  showRedirectModal: (to: string) => void;
};

export function AppHeaderLinks({
  small,
  openSettings,
  clickCloseIcon,
  redirectPopupTimestamp,
  showRedirectModal,
}: Props) {

  return (
    <div className="App-header-links">
      {small && (
        <div className="App-header-links-header">
          <div
            className="App-header-menu-icon-block mobile-cross-menu"
            onClick={() => clickCloseIcon && clickCloseIcon()}
          >
            <FiX className="App-header-menu-icon" />
          </div>
        </div>
      )}
      <div className="App-header-link-container">
        <ExternalLink href={"https://axiodex.com/"}>
          Home
        </ExternalLink>
      </div>
      <div className="App-header-link-container">
        <HeaderLink
          to="/airdrop"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <Trans>Airdrop</Trans>
        </HeaderLink>
      </div>
      <div className="App-header-link-container">
        {/* <ExternalLink href="https://app.1inch.io/#/1/simple/swap/ETH/0x4384b85fe228ae727b129230211194e4a50877c4"> */}
        <HeaderLink
          to="/dashboard"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <Trans>Dashboard</Trans>
        </HeaderLink>
      </div>
      <div className="App-header-link-container">
        <HeaderLink
          to="/earn"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <Trans>Earn</Trans>
        </HeaderLink>
      </div>
      <div className="App-header-link-container">
        <HeaderLink
          to="/buy"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <Trans>Buy</Trans>
        </HeaderLink>
      </div>
      <div className="App-header-link-container">
        <HeaderLink
          to="/referrals"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <Trans>Referrals</Trans>
        </HeaderLink>
      </div>
      {/* <div className="App-header-link-container">
        <HeaderLink
          to="/bridge"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <Trans>Bridge</Trans>
        </HeaderLink>
      </div> */}
      <div className="App-header-link-container">
        <ExternalLink href={"https://docs.axiodex.com/"}>
          About
        </ExternalLink>
      </div>

    </div>
  );
}
