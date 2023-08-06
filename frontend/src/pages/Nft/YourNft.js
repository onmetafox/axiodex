import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import { Trans } from "@lingui/macro";

import { formatAmount } from "lib/numbers";
import { contractFetcher } from "lib/contracts";

import Footer from "components/Footer/Footer";
import "./YourNft.css";
import SEO from "components/Common/SEO";
import { AXN_DECIMALS, getPageTitle } from "lib/legacy";

import mum from "img/mum.png";
import mum1 from "img/mum1.png";
import mum2 from "img/mum2.png";
import link_green from "img/link.svg";
import mintIcon from "img/ic_mint.svg";

import MummyClubVester from "abis/MummyClubVester.json"
import MummyClubNFT from "abis/MummyClubNFT.json";

import { useChainId } from "lib/chains";
import { getContract } from "config/contracts";

import ItemCard from "./ItemCard"
import { getProvider } from "lib/rpc";
import { ethers } from "ethers";
import axios from 'axios'
import Loader from "components/Common/Loader";

export default function YourNft() {
  const { active, library, account } = useWeb3React();
  
  const { chainId } = useChainId();
  const provider = getProvider(library, chainId);

  const [metaDatas, setMetaDatas] = useState([]);
  const [initMetaDatas, setInitMetaDatas] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [remainNfts, setRemainNfts] = useState(0);
  const [loading, setLoading] = useState(false);

  const step = 6;
  const mummyClubAddress = getContract("MummyClubNFT");
  const mummyClubVesterAddress = getContract("MummyClubVester");

  let totalSupply = 0;
  const { data: userNFTSupply } = useSWR(
    [active, chainId, mummyClubAddress, "balanceOf", account], 
    {
        fetcher: contractFetcher(library, MummyClubNFT),
    }
  );

  if (userNFTSupply)
    totalSupply = userNFTSupply.toString();

  const { data: bonus } = useSWR(
    [active, chainId, mummyClubVesterAddress, "bonusRewards", account], 
    {
        fetcher: contractFetcher(library, MummyClubVester),
    }
  );

  function showNfts() {
    return (
      <div className="yourNfts">
        { 
            metaDatas.map((metadata, index) => (
                <ItemCard imgPath={metadata.image} power={metadata.power} name={metadata.name} pageKind="list" key={index} />
            )
          )
        }
      </div>
    );
  }

  const onIncreasePage = async () => {
    setPageNumber(pageNumber + 1);
    setInitMetaDatas(metaDatas);
  };

  const contract = new ethers.Contract(mummyClubAddress, MummyClubNFT.abi, provider);
  const getEstimateAmount = async () => {
    let datas = initMetaDatas;
    if (datas.length >= totalSupply)
        return;

    setLoading(true);
    for (let i=(pageNumber - 1) * step; i<pageNumber * step; i++) {
        if (i > totalSupply - 1)
            break;

        const tokenId = await contract.tokenOfOwnerByIndex(account, i);
        const tokenUri = await contract.tokenURI(tokenId.toString());
        const tokenPower = await contract.getTokenPower(tokenId.toString());

        await axios.get(tokenUri, {
            }).then(x => {
                const metadata = {
                    name: x.data.name,
                    image: x.data.image,
                    power: tokenPower.toString()
                }

                datas.push(metadata)
            }).catch(() => {
              // console.error(err)
            });
    }

    setMetaDatas(datas);

    let remain = totalSupply <= step ?0 : totalSupply - pageNumber * step;
    setRemainNfts(remain);

    setLoading(false);
  }

  useEffect(() => {
    if (totalSupply > 0)
      getEstimateAmount();
    else
      setRemainNfts(0);

    setInitMetaDatas([]);
  }, [pageNumber, totalSupply]);

  return (
    <SEO title={getPageTitle("Stake NFT")}>
      <div className="page-layout YourNft-layout">
        <section className="sc-yournft">
          <div className="container">
            <div className="title"><Trans>Your AXN NFT</Trans></div>
            <div className="description"><Trans>Earn $FTM from platform's collected fees with your NFT</Trans></div>
            <div className="yourNftHeader">
                <div className="nft-avt-box">
                    <div className="avt-wrapper">
                        <img alt="mint" className="mum2" src={mum} data-xblocker="passed" /> 
                    </div>
                    <div className="total-nft">
                        <div className="nft-label"><Trans>Total NFT</Trans></div>
                        <div className="nft-amount">{formatAmount(userNFTSupply, 0, 0, true)}</div>
                    </div>
                    <div className="total-nft">
                        <div className="nft-label"><Trans>Your esAXN</Trans></div>
                        <div className="nft-amount">{formatAmount(bonus, AXN_DECIMALS, 0, true)}</div>
                    </div>
                </div>
                <div className="actions">
                    <a className="btn-outline" href="#/earn"><Trans>Earn with esAXN</Trans></a>
                    <a className="default-btn" href="#/nft"> 
                        <img alt="mint" src={mintIcon} /><Trans>Mint more NFT</Trans>
                    </a>
                </div>
            </div>
            <div className="nftPanel">
                { loading &&
                <div className="Modal">
                    <Loader />
                </div>
                }
                { totalSupply > 0 &&
                    showNfts()
                }
                { remainNfts > 0 &&
                    <div className="loadMore" 
                        onClick={() => {
                            onIncreasePage();
                        }}
                    >
                        Load more
                    </div>
                } 
                { totalSupply < 1 &&
                    <div className="yourNFtInfo">
                        <img src={mum} className="img-avt" alt="img" data-xblocker="passed" />
                        <div className="">
                        <div className="txt-asset"><Trans>You don't have any AXN NFT</Trans></div>
                        <a className="txt-link" href="#/nft"><Trans>Get Your AXN NFT</Trans> 
                            <img src={link_green} alt="" />
                        </a>
                        </div>
                    </div>
                }               
            </div>
          </div>
        </section>
        <section className="sc-startApp">
          <div className="container">
            <section className="panel">
              <img alt="mint" className="mum1" src={mum1} data-xblocker="passed" />
              <img alt="mint" className="mum2" src={mum2} data-xblocker="passed" />
              <div className="title"><Trans>Start in seconds</Trans></div>
              <div className="message"> 
                <div><Trans>Connect your crypto wallet to start using the app in seconds.</Trans></div><Trans>No registration needed.</Trans>
              </div>
              <a href="https://docs.axn.finance/trading#adding-a-wallet" className="default-btn" target="_bank"><Trans>Learn how to start</Trans>
              </a>
            </section>
          </div>
        </section>
        <Footer />
      </div>
    </SEO>
  );
}

