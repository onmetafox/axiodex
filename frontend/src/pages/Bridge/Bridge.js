import { Trans } from "@lingui/macro";
import SEO from "components/Common/SEO";
import Footer from "components/Footer/Footer";
import "./Bridge.css"
import { getPageTitle } from "lib/legacy";
import BridgeCard from "components/BridgeCard/BridgeCard";

const DESCRIPTION = ["Bridge $AXN seamlessly and securely across blockchains."];

export default function Bridge(props) {
  return (
    <SEO title={getPageTitle("Bridge")}>
      <div className="Bridge page-layout">
        <div className="Bridge-container default-container">
          <div className="section-title-block">
            <div className="section-title-content">
              <div className="Page-title">
                Bridge
              </div>
              <div className="Page-description">
              <div className="row">
                <p>{DESCRIPTION}</p>
              </div>
            </div>
            </div>
          </div>
          <BridgeCard {...props}/>
        </div>
        <Footer />
      </div>
    </SEO>
  );
}
