import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { Trans } from "@lingui/macro";

import { isHomeSite } from "lib/legacy";

import { useWeb3React } from "@web3-react/core";

import APRLabel from "../APRLabel/APRLabel";
import { HeaderLink } from "../Header/HeaderLink";
import { ARBITRUM, AVALANCHE, GOERLI, PUPPY_NET } from "config/chains";
import { switchNetwork } from "lib/wallets";
import { useChainId } from "lib/chains";
import ExternalLink from "components/ExternalLink/ExternalLink";
import { getIcon } from "config/icons";

import "./TokenCard.css";

const glpIcon = getIcon("common", "tlp");
const alpIcon = getIcon("common", "alp");
const gmxIcon = getIcon("common", "axn");

export default function TokenCard({ showRedirectModal, redirectPopupTimestamp }) {
  const isHome = isHomeSite();
  const { chainId } = useChainId();
  const { active } = useWeb3React();

  const changeNetwork = useCallback(
    (network) => {
      if (network === chainId) {
        return;
      }
      if (!active) {
        setTimeout(() => {
          return switchNetwork(network, active);
        }, 500);
      } else {
        return switchNetwork(network, active);
      }
    },
    [chainId, active]
  );

  return (
    <div className="Home-token-card-options">
      <div className="Home-token-card-option">
        <div className="Home-token-card-option-icon">
          <img src={gmxIcon} width="40" alt="AXN Icons" /> <span>AXN</span>
        </div>
        <div className="Home-token-card-option-info">
          <div className="Home-token-card-option-title">
            <Trans>AXN is the utility and governance token. Accrues 30% of the platform's generated fees.</Trans>
          </div>
          <div className="Home-token-card-option-apr">
            <Trans>Basechain APR: 2.04%</Trans>
          </div>

          {/* <div className="Home-token-card-option-apr">
            <Trans>Ethereum APR:</Trans> <APRLabel chainId={ARBITRUM} label="gmxAprTotal" />,{" "}
            <Trans>Shibarium APR:</Trans> <APRLabel chainId={AVALANCHE} label="gmxAprTotal" key="AVALANCHE" />
          </div> */}
          <div className="Home-token-card-option-action">
            <div className="buy">
              {/* <BuyLink to="/buy_tail" className="default-btn" network={ARBITRUM}>
                <Trans>Buy on Ethereum</Trans>
              </BuyLink> */}
              {/* <BuyLink to="/buy_tail" className="default-btn" network={AVALANCHE}>
                <Trans>Buy on Shibarium</Trans>
              </BuyLink> */}
              {/* <ExternalLink
                href="https://baseswap.fi/swap"
                className="default-btn read-more"
              >
                <Trans>Buy on Ethereum</Trans>
              </ExternalLink> */}
              <ExternalLink
                href="https://baseswap.fi/swap"
                className="default-btn read-more"
              >
                <Trans>Buy on Baseswap</Trans>
              </ExternalLink>
              <ExternalLink href="https://docs.axnfinance.com/tokenomics" className="default-btn read-more">
                <Trans>Read more</Trans>
              </ExternalLink>
            </div>

          </div>
        </div>
      </div>
      <div className="Home-token-card-option">
        <div className="Home-token-card-option-icon">
          <img src={alpIcon} width="40" alt="ALP Icon" /> <span>ALP</span>
        </div>
        <div className="Home-token-card-option-info">
          <div className="Home-token-card-option-title">
            <Trans>ALP is the liquidity provider token. Accrues 70% of the platform's generated fees.</Trans>
          </div>
          <div className="Home-token-card-option-apr">
            <Trans>Basechain APR: 2.04%</Trans>
          </div>
          <div className="Home-token-card-option-action">
            <div className="buy">
              <Link
                to="/buy_alp"
                className="default-btn read-more"
              >
                <Trans>Buy ALP</Trans>
              </Link>
              <ExternalLink href="https://docs.axnfinance.com/tokenomics" className="default-btn read-more">
                <Trans>Read more</Trans>
              </ExternalLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
