import React from "react";
import { Trans } from "@lingui/macro";
import Footer from "components/Footer/Footer";
import "./Buy.css";
import TokenCard from "components/TokenCard/TokenCard";
import buyGMXIcon from "img/buy_gmx.svg";
import SEO from "components/Common/SEO";
import { getPageTitle } from "lib/legacy";

export default function BuyGMXGLP() {
  return (
    <SEO title={getPageTitle("Buy AXL or ALP")}>
      <div className="BuyGMXGLP page-layout">
        <div className="BuyGMXGLP-container default-container buy">
          <div className="section-title-block">
            <div className="section-title-icon">
              <img src={buyGMXIcon} alt="buyGMXIcon" />
            </div>
            <div className="section-title-content">
              <div className="Page-title">
                <Trans>Buy AXL or ALP</Trans>
              </div>
            </div>
          </div>
          <TokenCard />
        </div>
        <Footer />
      </div>
    </SEO>
  );
}
