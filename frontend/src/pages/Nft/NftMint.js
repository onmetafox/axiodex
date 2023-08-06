import React from "react";
import useSWR from "swr";

import Footer from "components/Footer/Footer";
import "./NftMint.css";
import "./NftModal.css";
import SEO from "components/Common/SEO";
import { getPageTitle } from "lib/legacy";
import { Trans } from "@lingui/macro";

import mum1 from "img/mum1.png";
import mum2 from "img/mum2.png";
import link_green from "img/link.svg";

import bannerAvt from "img/banner-avt.png";
import deepBanner from "img/banner-vector.png";
import mintIcon from "img/ic_mint.svg";

import NftModal from "./NftModal";
import { Link } from "react-router-dom";
import { useChainId } from "lib/chains";
import { getContract } from "config/contracts";
import { contractFetcher } from "lib/contracts";
import MummyClubNFT from "abis/MummyClubNFT.json";
import MummyClubSale from "abis/MummyClubSale.json";
import { bigNumberify } from "lib/numbers";

import { getHomeUrl, getTradePageUrl } from "lib/legacy";

export default function NftMint() {
  const homeUrl = getHomeUrl();
  const tradePageUrl = getTradePageUrl();

  return (
    <SEO title={getPageTitle("Dashboard")}>
      <div className="page-layout">
        <div className="page-not-found-container">
          <div className="page-not-found">
            <h2>
              <Trans>Coming Soon</Trans>
            </h2>
            <p className="go-back">
              <Trans>
                <span>Return to </span>
                <a href={homeUrl}>Homepage</a> <span>or </span> <a href={tradePageUrl}>Trade</a>
              </Trans>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </SEO>
  );
}

// export default function NftMint({ connectWallet, setPendingTxns }) {
//   const [modalShown, toggleModal] = React.useState(false);

//   const { chainId } = useChainId();

//   const showModal = () => {
//     const body = document.body;
//     body.style.overflowY = 'hidden';

//     toggleModal(!modalShown);
//   }

//   let { data: nftSupply } = useSWR(
//     [`Nft:nftTotalSupply:${chainId}`, chainId, getContract("MummyClubNFT"), "totalSupply"],
//     {
//       fetcher: contractFetcher(undefined, MummyClubNFT),
//     }
//   );

//   nftSupply = nftSupply? nftSupply : 0;

//   let { data: nftMaxCount } = useSWR(
//     [`Nft:nftTotalSupply:${chainId}`, chainId, getContract("MummyClubSale"), "MAX_MMC"],
//     {
//       fetcher: contractFetcher(undefined, MummyClubSale),
//     }
//   );

//   nftMaxCount = nftMaxCount? nftMaxCount : 0;

//   return (
//     <SEO title={getPageTitle("Nft")}>
//       <div className="page-layout Nft-layout">
//         <section className="club">
//           <NftModal shown={modalShown} connectWallet={connectWallet} setPendingTxns={setPendingTxns}
//             close={() => 
//               {toggleModal(false);
//             }}
//           />
//           <div className="clubPanel">
//             <img alt="avt" src={bannerAvt} className="avt-img" />
//             <div className="avt-content"> 
//               <img alt="mint" className="deep-banner" src={deepBanner} />
//               <div className="title">Tail Club</div>
//               <div className="desc"><Trans>A collection of 5,000 Tail NFT on Shibarium, creating a community centered around strong identity, values, and rewards</Trans></div>
//               <div className="actions">
//                 { bigNumberify(nftMaxCount).gt(bigNumberify(nftSupply))  && 
//                   ( 
//                     <button className="default-btn" onClick={showModal}> 
//                       <img alt="mint" src={mintIcon} /><Trans>Mint NFT</Trans>
//                     </button>
//                   )
//                 }
//                 { bigNumberify(nftSupply).eq(bigNumberify(nftMaxCount)) && 
//                   ( 
//                     <button className="default-btn soldout" disabled> 
//                       <img alt="mint" src={mintIcon} /><Trans>Sold out</Trans>
//                     </button>
//                   )
//                 }
//                 <a className="default-btn" rel="noreferrer" href="https://paintswap.finance/marketplace/fantom/collections/tail-club" target="_blank"><Trans>Trade on PaintSwap</Trans></a>
//               </div>
//               <div className="goTo" >
//                 <div className="button">
//                 <Link to="/your_nft">
//                 <Trans>Go to your NFT</Trans>
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="banner">
//             <div className="banner-content"></div> 
//           </div>
//         </section>
//         {/* <section className="treasury">
//           <div className="container">
//             <div className="titlePanel">
//               <div className="title">Treasury</div>
//               <div className="subTitle">Profits from Treasury yield will be distributed to all NFT holders</div>
//             </div>
//             <div className="graphPanel">
//               <div className="data">
//                 <div>
//                   <div className="label">Total staked</div>
//                   <div className="amount--large">
//                     <span className="Tooltip">
//                       <span className="Tooltip-handle">$473,240.82</span>
//                     </span>
//                   </div>
//                 </div>
//                 <div className="stats-right">
//                   <div>
//                     <div className="label">Compounding Reward</div>
//                     <div className="amount">
//                       <span>1.59</span> esAXN
//                     </div>
//                   </div> 
//                   <div className="pending-box">
//                     <div className="label">Pending Reward</div>
//                     <div className="amount">
//                       <span>56.86 </span> esAXN + 
//                       <span>1,439.87 </span>FTM
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section> */}
//         <section className="smallBanner">
//           <div className="banner-part">
//             <div className="banner-content"></div> 
//           </div>
//         </section>
//         <section className="rewardPanel">
//           <div className="container">
//             <div className="title"><Trans>How to get reward with Tail Club</Trans></div>
//             <div className="subTitle"><Trans>Very simple, you just need to hold Tail NFT</Trans></div>
//             <div className="rewardBlock">
//               <div className="subBlock">
//                 <div className="step-number">1</div>
//                 <div className="step-content">
//                   <div className="label"><Trans>Mint NFT</Trans></div>
//                   <div className="content"><Trans>The earlier you mint, the cheaper the NFT and the higher the power to earn rewards.</Trans></div>
//                   <div className="howto-link"
//                     onClick={showModal}
//                   >
//                     Mint now
//                   </div>
//                 </div>
//               </div>
//               <div className="subBlock">
//                 <div className="step-number">2</div>
//                 <div className="step-content">
//                   <div className="label"><Trans>Stake</Trans></div>
//                   <div className="content"><Trans>Stake your NFT to earn rewards from Community Treasury.</Trans></div>
//                   <a className="howto-link" href="#/stake-nft"><Trans>Stake now</Trans>
//                     <img alt="mint" src={link_green} /> 
//                   </a>
//                 </div>
//               </div>
//               <div className="subBlock">
//                 <div className="step-number">3</div>
//                 <div className="step-content">
//                   <div className="label"><Trans>Earn</Trans></div>
//                   <div className="content"><Trans>Earn rewards in $FTM. The longer you stake, the higher rewards you earn from Tail Finance.</Trans></div>
//                   <a className="howto-link" href="#/stake-nft"><Trans>See your reward</Trans> 
//                     <img alt="mint" src={link_green} /> 
//                   </a>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//         <section className="startPanel">
//           <div className="container">
//             <section className="startBlock">
//               <img alt="mint" className="mum1" src={mum1}/>
//               <img alt="mint" className="mum2" src={mum2} />
//               <div className="title"><Trans>Start in seconds</Trans></div>
//               <div className="subTitle"> 
//                 <div><Trans>Connect your crypto wallet to start using the app in seconds.</Trans></div>
//                 <Trans>No registration needed.</Trans>
//               </div>
//               <a href="https://docs.axn.finanace/trading#adding-a-wallet" className="default-btn" target="_bank"><Trans>Learn how to start</Trans></a>
//             </section>
//           </div>
//         </section> 
//         <Footer />
//       </div>
//     </SEO>
//   );
// }
