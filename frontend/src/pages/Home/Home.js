import React from "react";
import Footer from "components/Footer/Footer";
import "./Home.css";

import simpleSwapIcon from "img/ic_simpleswaps.svg";
import costIcon from "img/ic_cost_1.svg";
import liquidityIcon from "img/ic_liquid.svg";
import swapIcon from "img/ic_swap.svg";
import arbitrunIcon from "img/ic_arbitrum_96.svg";
import avalanIcon from "img/ic_avalanche_96.svg"
import statsIcon from "img/ic_stats.svg";
import tradingIcon from "img/ic_trading_1.svg";
import dogMark from "img/dog.svg";
import bigLogo from "img/big_logo.svg";
import logo from "img/logo_mb.svg";

import useSWR from "swr";

import { USD_DECIMALS, getTotalVolumeSum } from "lib/legacy";

import { useUserStat } from "domain/legacy";

import ethereumIcon from "img/ic_eth_40.svg";
import shibariumIcon from "img/ic_shib_64.svg";

import TokenCard from "components/TokenCard/TokenCard";
import { Trans } from "@lingui/macro";
import { HeaderLink } from "components/Header/HeaderLink";
import { ARBITRUM, AVALANCHE } from "config/chains";
import { getServerUrl } from "config/backend";
import { bigNumberify, formatAmount, numberWithCommas } from "lib/numbers";
import Button from "components/Button/Button";
import ImgIcon from "components/IconComponent/ImgIcon";


export default function Home({ showRedirectModal, redirectPopupTimestamp }) {
  // const [openedFAQIndex, setOpenedFAQIndex] = useState(null)
  // const faqContent = [{
  //   id: 1,
  //   question: "What is AXN?",
  //   answer: "AXN is a decentralized spot and perpetual exchange that supports low swap fees and zero price impact trades.<br><br>Trading is supported by a unique multi-asset pool that earns liquidity providers fees from market making, swap fees, leverage trading (spreads, funding fees & liquidations), and asset rebalancing.<br><br>Dynamic pricing is supported by Chainlink Oracles along with TWAP pricing from leading volume DEXs."
  // }, {
  //   id: 2,
  //   question: "What is the AXN Governance Token? ",
  //   answer: "The AXN token is the governance token of the AXN ecosystem, it provides the token owner voting rights on the direction of the AXN platform.<br><br>Additionally, when AXN is staked you will earn 30% of the platform-generated fees, you will also earn Escrowed AXN tokens and Multiplier Points."
  // }, {
  //   id: 3,
  //   question: "What is the ALP Token? ",
  //   answer: "The ALP token represents the liquidity users provide to the AXN platform for Swaps and Margin Trading.<br><br>To provide liquidity to ALP you <a href='https://axn.finanace/buy_tlp' target='_blank'>trade</a> your crypto asset BTC, ETH, LINK, UNI, USDC, USDT, MIM, or FRAX to the liquidity pool, in exchange, you gain exposure to a diversified index of tokens while earning 50% of the platform trading fees and esAXN."
  // }, {
  //   id: 4,
  //   question: "What can I trade on AXN? ",
  //   answer: "On AXN you can swap or margin trade any of the following assets: ETH, BTC, LINK, UNI, USDC, USDT, MIM, FRAX, with others to be added. "
  // }]

  // const toggleFAQContent = function(index) {
  //   if (openedFAQIndex === index) {
  //     setOpenedFAQIndex(null)
  //   } else {
  //     setOpenedFAQIndex(index)
  //   }
  // }

  // // ARBITRUM

  // const arbitrumPositionStatsUrl = getServerUrl(ARBITRUM, "/position_stats");
  // const { data: arbitrumPositionStats } = useSWR([arbitrumPositionStatsUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.json()),
  // });

  // const arbitrumTotalVolumeUrl = getServerUrl(ARBITRUM, "/total_volume");
  // const { data: arbitrumTotalVolume } = useSWR([arbitrumTotalVolumeUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.json()),
  // });

  // // AVALANCHE

  // const avalanchePositionStatsUrl = getServerUrl(AVALANCHE, "/position_stats");
  // const { data: avalanchePositionStats } = useSWR([avalanchePositionStatsUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.json()),
  // });

  // const avalancheTotalVolumeUrl = getServerUrl(AVALANCHE, "/total_volume");
  // const { data: avalancheTotalVolume } = useSWR([avalancheTotalVolumeUrl], {
  //   fetcher: (...args) => fetch(...args).then((res) => res.json()),
  // });

  // // Total Volume

  // const arbitrumTotalVolumeSum = getTotalVolumeSum(arbitrumTotalVolume);
  // const avalancheTotalVolumeSum = getTotalVolumeSum(avalancheTotalVolume);

  let totalVolumeSum = bigNumberify(0);
  // if (arbitrumTotalVolumeSum && avalancheTotalVolumeSum) {
  //   totalVolumeSum = totalVolumeSum.add(arbitrumTotalVolumeSum);
  //   totalVolumeSum = totalVolumeSum.add(avalancheTotalVolumeSum);
  // }

  // Open Interest

  let openInterest = bigNumberify(0);
  // if (
  //   arbitrumPositionStats &&
  //   arbitrumPositionStats.totalLongPositionSizes &&
  //   arbitrumPositionStats.totalShortPositionSizes
  // ) {
  //   openInterest = openInterest.add(arbitrumPositionStats.totalLongPositionSizes);
  //   openInterest = openInterest.add(arbitrumPositionStats.totalShortPositionSizes);
  // }

  // if (
  //   avalanchePositionStats &&
  //   avalanchePositionStats.totalLongPositionSizes &&
  //   avalanchePositionStats.totalShortPositionSizes
  // ) {
  //   openInterest = openInterest.add(avalanchePositionStats.totalLongPositionSizes);
  //   openInterest = openInterest.add(avalanchePositionStats.totalShortPositionSizes);
  // }

  // user stat
  // const arbitrumUserStats = useUserStat(ARBITRUM);
  // const avalancheUserStats = useUserStat(AVALANCHE);
  let totalUsers = 0;

  // if (arbitrumUserStats && arbitrumUserStats.uniqueCount) {
  //   totalUsers += arbitrumUserStats.uniqueCount;
  // }

  // if (avalancheUserStats && avalancheUserStats.uniqueCount) {
  //   totalUsers += avalancheUserStats.uniqueCount;
  // }

  const LaunchExchangeButton = () => {
    return (
      <HeaderLink
        className="default-btn"
        to="/trade"
        redirectPopupTimestamp={redirectPopupTimestamp}
        showRedirectModal={showRedirectModal}
      >
        <Trans>Launch App</Trans>
      </HeaderLink>
    );
  };

  return (
    <div className="Home landing">
      <div className="Home-top">
        {/* <div className="Home-top-image"></div> */}
        {/* <div className="Home-title-section-container default-container">
          <div className="Home-title-section logo_mb-section">
            <img src={logo} alt="Network Icon" className="logo_mb" />
          </div>
        </div> */}
        <div className="Home-title-section-container default-container">
          <div className="row home-top-container">
            <div className="col-lg-8 col-md-12 col-sm-12">
              <div className="row">
                <div className="col-sm-12">
                  <div className="title-welcome padding-1r">
                    <Trans>Welcome to</Trans>
                  </div>
                </div>
                <div className="col-sm-12">
                  <div className="title-logo padding-1r">
                    <Trans>AXIODEX</Trans>
                  </div>
                </div>
                <div className="col-sm-12">
                  <Button className="btn-landing-launch">Launch APP</Button>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-12  col-sm-12">
              <img src={bigLogo}/>
            </div>
          </div>
          <div className="row trading-top-container">
            <div className="col-lg-4 col-md-12 col-sm-12">
              <div className="home-top-container">
                <ImgIcon icon = {tradingIcon} title = "Total Trading Volume" value ="$138,773,667,204" className ="landing-img-icon"/>
              </div>
            </div>
            <div className="col-lg-4 col-md-12 col-sm-12">
              <div className="home-top-container">
                <ImgIcon icon = {tradingIcon} title = "Total Trading Volume" value ="$138,773,667,204" className ="landing-img-icon"/>
              </div>
            </div>
            <div className="col-lg-4 col-md-12 col-sm-12">
              <div className="home-top-container">
                <ImgIcon icon = {tradingIcon} title = "Total Trading Volume" value ="$138,773,667,204" className ="landing-img-icon"/>
              </div>
            </div>
          </div>
          {/* <div className="Home-title-section">
            <div className="Home-logo">
              <Trans>
                Tail Finance
              </Trans>
            </div>
            <div className="Home-title">
              <Trans>
                Shibarium's Decentralized
                <br />
                Perpetual Exchange
              </Trans>
            </div>
            <div className="Home-description">
              <Trans>
                Trade BTC, ETH, PLS and other top cryptocurrencies with up to 50x leverage directly from your wallet
              </Trans>
            </div>
            <LaunchExchangeButton />
          </div>
          <div>
            <img src={dogMark} alt="dog mark" className="dogmark" />
          </div> */}
        </div>
        {/* <div className="Home-latest-info-container default-container">
          <div className="Home-latest-info-block">
            <img src={tradingIcon} alt="Total Trading Volume Icon" className="Home-latest-info__icon" />
            <div className="Home-latest-info-content">
              <div className="Home-latest-info__title">
                <Trans>Total Trading Volume</Trans>
              </div>
              <div className="Home-latest-info__value">${formatAmount(totalVolumeSum, USD_DECIMALS, 0, true)}</div>
            </div>
          </div>
          <div className="Home-latest-info-block">
            <img src={statsIcon} alt="Open Interest Icon" className="Home-latest-info__icon" />
            <div className="Home-latest-info-content">
              <div className="Home-latest-info__title">
                <Trans>Open Interest</Trans>
              </div>
              <div className="Home-latest-info__value">${formatAmount(openInterest, USD_DECIMALS, 0, true)}</div>
            </div>
          </div>
          <div className="Home-latest-info-block">
            <img src={totaluserIcon} alt="Total Users Icon" className="Home-latest-info__icon" />
            <div className="Home-latest-info-content">
              <div className="Home-latest-info__title">
                <Trans>Total Users</Trans>
              </div>
              <div className="Home-latest-info__value">{numberWithCommas(totalUsers.toFixed(0))}</div>
            </div>
          </div>
        </div> */}
      </div>
      <div className="Home-benefits-section">
        <div className="Home-benefits default-container">
          <div className="Home-benefit">
            <div className="Home-benefit-icon">
              <img src={bigLogo} alt="Reduce Liquidation Risks Icon" className="Home-benefit-icon-symbol" />
              
            </div>
            <div className="Home-benifit-content">
              <div className="Home-benefit-title">
                <Trans>About US</Trans>
              </div>
              <div className="Home-benefit-description">
                <Trans>
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. 
                </Trans>
              </div>
            </div>
            
          </div>
          {/* <div className="Home-benefit">
            <div className="Home-benefit-icon">
              <img src={costIcon} alt="Save on Costs Icon" className="Home-benefit-icon-symbol" />
              <div className="Home-benefit-title">
                <Trans>Save on Costs</Trans>
              </div>
            </div>
            <div className="Home-benefit-description">
              <Trans>
              Execute positions with negligible spreads and zero price impact, ensuring that the best possible price is obtained without incurring any extra expenses.
              </Trans>
            </div>
          </div>
          <div className="Home-benefit">
            <div className="Home-benefit-icon">
              <img src={simpleSwapIcon} alt="Simple Swaps Icon" className="Home-benefit-icon-symbol" />
              <div className="Home-benefit-title">
                <Trans>#ShibArmy Burn</Trans>
              </div>
            </div>
            <div className="Home-benefit-description">
              <Trans>
              To support the #ShibArmy and Shib Common Values 20% of trading fees generated from the platform will be used to buy and burn $SHIB.
              </Trans>
              <br />
              <br />
            </div>
          </div> */}
        </div>
      </div>
      <div className="Home-cta-section">
        <div className="Home-cta-container default-container">
          <div className="col-lg-4 col-md-12 col-sm-12 padding-1r">
            <div className="Home-benefit-icon">
              <img src={liquidityIcon} alt="Reduce Liquidation Risks" className="Home-benefit-icon-symbol" />
              <div className="Home-benefit-title">
                <Trans>Reduce Liquidation Risks</Trans>
              </div>
            </div>
            <div className="Home-benefit-description">
              <Trans>
              An aggregate of high-quality price feeds determine when liquidations occur. This keeps positions safe from temporary wicks.
              </Trans>
            </div>
          </div>
          <div className="col-lg-4 col-md-12 col-sm-12 padding-1r">
            <div className="Home-benefit-icon">
              <img src={costIcon} alt="Save on Costs Icon" className="Home-benefit-icon-symbol" />
              <div className="Home-benefit-title">
                <Trans>Save on Costs</Trans>
              </div>
            </div>
            <div className="Home-benefit-description">
              <Trans>
              Enter and exit positions with minimal spread and zero price impact. Get the optimal price without incurring additional costs.
              </Trans>
            </div>
          </div>
          <div className="col-lg-4 col-md-12 col-sm-12 padding-1r">
            <div className="Home-benefit-icon">
              <img src={swapIcon} alt="Simple Swaps" className="Home-benefit-icon-symbol" />
              <div className="Home-benefit-title">
                <Trans>Simple Swaps</Trans>
              </div>
            </div>
            <div className="Home-benefit-description">
              <Trans>
              Open positions through a simple swap interface. Conveniently swap from any supported asset into the position of your choice.
              </Trans>
            </div>
          </div>
           
          {/* <div className="Home-cta-info">
            <div className="Home-cta-info__title">
              <Trans>Available on your preferred network</Trans>
            </div>
            <div className="Home-cta-info__description">
              <Trans>AXN is currently live on Goerli and soon will be on Shibarium.</Trans>
            </div>
          </div>
          <div className="Home-cta-options">
           <div className="Home-cta-option Home-cta-option-arbitrum">
              <div className="Home-cta-option-icon">
                <img src={ethereumIcon} width="96" alt="Ethereum Icon" />
              </div>
              <div className="Home-cta-option-info">
                <div className="Home-cta-option-title">Ethereum</div>
                <div className="Home-cta-option-action">
                  <LaunchExchangeButton />
                </div>
              </div>
            </div>
            <div className="Home-cta-option Home-cta-option-ava">
              <div className="Home-cta-option-icon">
                <img src={shibariumIcon} width="96" alt="Shibarium Icon" />
              </div>
              <div className="Home-cta-option-info">
                <div className="Home-cta-option-title">Shibarium</div>
                <div className="Home-cta-option-action">
                  <LaunchExchangeButton />
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
      <div className="Home-token-card-section">
        <div className="Home-token-card-container default-container row">
          <div className="col-lg-6 col-md-12 col-sm-12">
            <div className="Home-cta-info__title">
              <Trans>Available on your preferred network</Trans>
            </div>
            <div className="Home-cta-info__description">
              <Trans>GMX is currently live on Arbitrum and Avalanche.</Trans>
            </div>
          </div>
          <div className="col-lg-6 col-md-12 col-sm-12">
            <div className="Home-cta-option Home-cta-option-arbitrum">
              <div className="Home-cta-option-icon">
                <img src={arbitrunIcon} width="96" alt="Ethereum Icon" />
              </div>
              <div className="Home-cta-option-info">
                <div className="Home-cta-option-title">Arbitrum</div>
                <div className="Home-cta-option-action">
                  <LaunchExchangeButton />
                </div>
              </div>
            </div>
            <div className="Home-cta-option Home-cta-option-ava">
              <div className="Home-cta-option-icon">
                <img src={avalanIcon} width="96" alt="Shibarium Icon" />
              </div>
              <div className="Home-cta-option-info">
                <div className="Home-cta-option-title">Avalanche</div>
                <div className="Home-cta-option-action">
                  <LaunchExchangeButton />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* <div className="Home-video-section">
        <div className="Home-video-container default-container">
          <div className="Home-video-block">
            <img src={gmxBigIcon} alt="gmxbig" />
          </div>
        </div>
      </div> */}
      {/* <div className="Home-faqs-section">
        <div className="Home-faqs-container default-container">
          <div className="Home-faqs-introduction">
            <div className="Home-faqs-introduction__title">FAQs</div>
            <div className="Home-faqs-introduction__description">Most asked questions. If you wish to learn more, please head to our Documentation page.</div>
            <a href="https://gmxio.gitbook.io/gmx/" className="default-btn Home-faqs-documentation">Documentation</a>
          </div>
          <div className="Home-faqs-content-block">
            {
              faqContent.map((content, index) => (
                <div className="Home-faqs-content" key={index} onClick={() => toggleFAQContent(index)}>
                  <div className="Home-faqs-content-header">
                    <div className="Home-faqs-content-header__icon">
                      {
                        openedFAQIndex === index ? <FiMinus className="opened" /> : <FiPlus className="closed" />
                      }
                    </div>
                    <div className="Home-faqs-content-header__text">
                      { content.question }
                    </div>
                  </div>
                  <div className={ openedFAQIndex === index ? "Home-faqs-content-main opened" : "Home-faqs-content-main" }>
                    <div className="Home-faqs-content-main__text">
                      <div dangerouslySetInnerHTML={{__html: content.answer}} >
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div> */}
      <Footer showRedirectModal={showRedirectModal} redirectPopupTimestamp={redirectPopupTimestamp} />
    </div>
  );
}
