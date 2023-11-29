import SEO from "components/Common/SEO";
import { getPageTitle } from "lib/legacy";
import Footer from "components/Footer/Footer";
import "./Airdrop.css"
import AirdropBox from "components/AirdropBox/AirdropBox";

const DESCRIPTION = ["You can airdrop in here"]
export default function Airdrop(props) {
  return (
    <SEO title={getPageTitle("Airdrop")}>
      <div className="airdrop aidrop-container page-layout default-container">
        <div className="section-title-block">
          <div className="section-title-content">
            <div className="Page-title">
              Airdrop
            </div>
            <div className="Page-description">
              <div className="row">
                <p>{DESCRIPTION}</p>
              </div>
            </div>
          </div>
        </div>
        <AirdropBox {...props}/>
      </div>
      <Footer />
    </SEO>
  );
}
