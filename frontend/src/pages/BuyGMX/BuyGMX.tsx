import React, { useCallback } from "react";
import Footer from "components/Footer/Footer";
import "./BuyGMX.css";
import { useWeb3React } from "@web3-react/core";
import { Trans, t } from "@lingui/macro";
import Button from "components/Button/Button";
import { DEFAULT_CHAIN_ID, getChainName, getConstant } from "config/chains";
import { switchNetwork } from "lib/wallets";
import { useChainId } from "lib/chains";
import Card from "components/Common/Card";
import { importImage } from "lib/legacy";
import ExternalLink from "components/ExternalLink/ExternalLink";

import bondProtocolIcon from "img/ic_bondprotocol_arbitrum.svg";
import uniswapArbitrumIcon from "img/ic_uni_arbitrum.svg";
import traderjoeIcon from "img/ic_traderjoe_avax.png";
import {
  BUY_NATIVE_TOKENS,
  CENTRALISED_EXCHANGES,
  DECENTRALISED_AGGRIGATORS,
  EXTERNAL_LINKS,
  FIAT_GATEWAYS,
  GMX_FROM_ANY_NETWORKS,
  TRANSFER_EXCHANGES,
} from "./constants";

export default function BuyGMX() {
  const { chainId } = useChainId();
  const { active } = useWeb3React();
  const nativeTokenSymbol = getConstant(chainId, "nativeTokenSymbol");
  const externalLinks = EXTERNAL_LINKS[chainId];

  const onNetworkSelect = useCallback(
    (value) => {
      if (value === chainId) {
        return;
      }
      return switchNetwork(value, active);
    },
    [chainId, active]
  );

  return (
    <div className="BuyGMXGLP default-container page-layout">
      <div className="BuyGMXGLP-container">
        <div className="section-title-block">
          <div className="section-title-content">
            <div className="Page-title">
              <Trans>Buy AXN on {getChainName(DEFAULT_CHAIN_ID)}</Trans>
            </div>
            <div className="Page-description">
              <Trans>Choose to buy from decentralized or centralized exchanges.</Trans>
              <br />
              <Trans>
                To purchase AXN on the {getChainName(DEFAULT_CHAIN_ID)} blockchain, please{" "}
                <span onClick={() => onNetworkSelect(DEFAULT_CHAIN_ID)}>change your network</span>.
              </Trans>
            </div>
          </div>
        </div>
        <div className="cards-row">
          <DecentralisedExchanges chainId={chainId} externalLinks={externalLinks} />
          <CentralisedExchanges chainId={chainId} />
        </div>

        <div className="section-title-block mt-top">
          <div className="section-title-content">
            <div className="Page-title">
              <Trans>Buy or Transfer ETH to Ethereum</Trans>
            </div>
            <div className="Page-description">
              <Trans>Buy ETH directly to Ethereum or transfer it there.</Trans>
            </div>
          </div>
        </div>

        <div className="cards-row">
          <Card title={t`Buy ${nativeTokenSymbol}`}>
            <div className="App-card-content">
              <div className="BuyGMXGLP-description">
                <Trans>
                  You can buy ETH directly on{" "}
                  <ExternalLink href={externalLinks.networkWebsite}>Ethereum</ExternalLink> using these options:
                </Trans>
              </div>
              <div className="buttons-group">
                {BUY_NATIVE_TOKENS.filter((e) => chainId in e.links).map((exchange) => {
                  const icon = importImage(exchange.icon) || "";
                  const link = exchange.links[chainId];
                  return (
                    <Button key={exchange.name} href={link} imgSrc={icon}>
                      {exchange.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </Card>
          <Card title={t`Transfer ${nativeTokenSymbol}`}>
            <div className="App-card-content">
              <div className="BuyGMXGLP-description">
                <Trans>You can transfer ETH from other networks to Ethereum using any of the below options:</Trans>
              </div>
              <div className="buttons-group">
                {TRANSFER_EXCHANGES.filter((e) => chainId in e.links).map((exchange) => {
                  const icon = importImage(exchange.icon) || "";
                  const link = exchange.links[chainId];
                  return (
                    <Button key={exchange.name} href={link} imgSrc={icon}>
                      {exchange.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function DecentralisedExchanges({ chainId, externalLinks }) {
  return (
    <Card title={t`Buy AXN from a Decentralized Exchange`}>
      <div className="App-card-content">
        <div className="exchange-info-group">
          <div className="BuyGMXGLP-description">
            <Trans>Buy AXN from Uniswap (make sure to select Ethereum):</Trans>
          </div>
          <div className="buttons-group col-1">
            <Button imgSrc={uniswapArbitrumIcon} href={externalLinks.buyGmx.uniswap}>
              Uniswap
            </Button>
          </div>
        </div>
        <div className="exchange-info-group">
          <div className="BuyGMXGLP-description">
            <Trans>Buy AXN using Decentralized Exchange Aggregators:</Trans>
          </div>
          <div className="buttons-group">
            {DECENTRALISED_AGGRIGATORS.filter((e) => chainId in e.links).map((exchange) => {
              const icon = importImage(exchange.icon) || "";
              const link = exchange.links[chainId];
              return (
                <Button key={exchange.name} imgSrc={icon} href={link}>
                  {exchange.name}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="exchange-info-group">
          <div className="BuyGMXGLP-description">
            <Trans>Buy AXN using any token from any network:</Trans>
          </div>
          <div className="buttons-group">
            {GMX_FROM_ANY_NETWORKS.filter((e) => chainId in e.links).map((exchange) => {
              const icon = importImage(exchange.icon) || "";
              const link = exchange.links[chainId];
              return (
                <Button key={exchange.name} href={link} imgSrc={icon}>
                  {exchange.name}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="exchange-info-group">
          <div className="BuyGMXGLP-description">
            <Trans>AXN bonds can be bought on Bond Protocol with a discount and a small vesting period:</Trans>
          </div>
          <div className="buttons-group col-1">
            <Button imgSrc={bondProtocolIcon} href="https://app.bondprotocol.finance/#/issuers/GMX">
              Bond Protocol
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CentralisedExchanges({ chainId }) {
  return (
    <Card title={t`Buy AXN from centralized services`}>
      <div className="App-card-content">
        <div className="exchange-info-group">
          <div className="BuyGMXGLP-description">
            <Trans>Buy AXN from centralized exchanges:</Trans>
          </div>
          <div className="buttons-group">
            {CENTRALISED_EXCHANGES.filter((e) => chainId in e.links).map((exchange) => {
              const icon = importImage(exchange.icon) || "";
              const link = exchange.links[chainId];
              return (
                <Button key={exchange.name} href={link} imgSrc={icon}>
                  {exchange.name}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="exchange-info-group">
          <div className="BuyGMXGLP-description">
            <Trans>Buy AXN using FIAT gateways:</Trans>
          </div>
          <div className="buttons-group col-2">
            {FIAT_GATEWAYS.filter((e) => chainId in e.links).map((exchange) => {
              const icon = importImage(exchange.icon) || "";
              let link = exchange.links[chainId];

              return (
                <Button key={exchange.name} href={link} imgSrc={icon}>
                  {exchange.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
