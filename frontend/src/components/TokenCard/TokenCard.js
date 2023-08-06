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

  const BuyLink = ({ className, to, children, network }) => {
    if (isHome && showRedirectModal) {
      return (
        <HeaderLink
          to={to}
          className={className}
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          {children}
        </HeaderLink>
      );
    }

    return (
      <Link to={to} className={className} onClick={() => changeNetwork(network)}>
        {children}
      </Link>
    );
  };

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
            <Trans>Pulsechain APR: 2.04%, Arbitrum APR: 2.08%</Trans>
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
              <ExternalLink
                href="https://shibaswap.com/#/swap?inputCurrency=ETH&outputCurrency=0x4384b85fe228ae727b129230211194e4a50877c4"
                className="default-btn read-more"
              >
                <Trans>Buy on Ethereum</Trans>
              </ExternalLink>
              <ExternalLink
                href=""
                className="default-btn read-more"
              >
                <Trans>Buy on Shibarium</Trans>
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
          <img src={gmxIcon} width="40" alt="ALP Icon" /> <span>esAXN</span>
        </div>
        <div className="Home-token-card-option-info">
          <div className="Home-token-card-option-title">
            <Trans>esAXN is the liquidity provider token. Accrues 70% of the platform's generated fees.</Trans>
          </div>
          <div className="Home-token-card-option-apr">
            <Trans>Pulsechain APR: 2.04%, Arbitrum APR: 2.08%</Trans>
            {/* <Trans></Trans> */}
            {/* <Trans>Ethereum APR:</Trans> <APRLabel chainId={ARBITRUM} label="glpAprTotal" key="ARBITRUM" />,{" "}
            <Trans>Shibarium APR:</Trans> <APRLabel chainId={AVALANCHE} label="glpAprTotal" key="AVALANCHE" /> */}
          </div>
          <div className="Home-token-card-option-action">
            <div className="buy">
              {/* <BuyLink to="/buy_tlp" className="default-btn" network={ARBITRUM}>
                <Trans>Buy on Ethereum</Trans>
              </BuyLink>
              <BuyLink to="/buy_tlp" className="default-btn" network={AVALANCHE}>
                <Trans>Buy on Shibarium</Trans>
              </BuyLink> */}
              {/* <div className="default-btn ethereum">
                <Trans>Buy on Ethereum</Trans>
              </div> */}
              {/* <BuyLink to="/buy_tlp" className="default-btn" network={GOERLI}>
                <Trans>Buy on Goerli</Trans>
              </BuyLink>
              <div className="default-btn" >
                <Trans>Buy on Shibarium</Trans>
              </div> */}
              <ExternalLink
                href="https://shibaswap.com/#/swap?inputCurrency=ETH&outputCurrency=0x4384b85fe228ae727b129230211194e4a50877c4"
                className="default-btn read-more"
              >
                <Trans>Buy on Ethereum</Trans>
              </ExternalLink>
              <ExternalLink
                href=""
                className="default-btn read-more"
              >
                <Trans>Buy on Shibarium</Trans>
              </ExternalLink>
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
