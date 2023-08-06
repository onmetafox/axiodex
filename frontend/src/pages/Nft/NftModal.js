import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import { t } from "@lingui/macro";

import mum1 from "img/mum1.png";
import link_white from "img/link-white.svg";
import icInfo from "img/ic_info.svg";
import mintIcon from "img/ic_mint.svg";
import axios from "axios";

import TooltipComponent from "components/Tooltip/Tooltip";
import MintCountDropdown from "./MintCountDropdown";
import "./NftModal.css";
import { StyledSlider } from "./Box.styled";

import { bigNumberify, formatAmount } from "lib/numbers";
import { callContract, contractFetcher } from "lib/contracts";
import { AXN_DECIMALS } from "lib/legacy";
import { useChainId } from "lib/chains";
import { GOERLI, PUPPY_NET, NETWORK_METADATA } from "config/chains";
import { getNativeToken } from "config/tokens";
import { getContract } from "config/contracts";
import { useTotalMummyClubNftInfo } from "domain/legacy";

import Reader from "abis/Reader.json";
import MummyClubSale from "abis/MummyClubSale.json";
import MummyClubNFT from "abis/MummyClubNFT.json";

import { ethers } from "ethers";
import { getProvider } from "lib/rpc";

import { getIcon } from "config/icons";

const { AddressZero } = ethers.constants;

function NftModal(props) {
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();
  const provider = getProvider(library, chainId);

  const tokenIcon = getIcon(chainId, "network");

  const { shown, close, connectWallet, setPendingTxns } = props;

  const [nftCount, setNftCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(bigNumberify(0));

  const [isMinting, setIsMinting] = useState(false);

  const [latestImageList, setlatestImageList] = useState([]);

  const salerAddress = getContract("MummyClubSale");
  const saleContract = new ethers.Contract(salerAddress, MummyClubSale.abi, provider);

  //   useEffect(() => {
  //     const getEstimateAmount = async () => {
  //         const amount = await saleContract.estimateAmount(nftCount);
  //         setTotalPrice(amount._totalPrice);
  //     }

  //     getEstimateAmount();
  //   }, [nftCount]);

  const onSelectCount = (count) => {
    setNftCount(count);
  };

  const closeModal = () => {
    const body = document.body;
    body.style.overflowY = "";
    close();
  };

  const settings = {
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    speed: 2500,
  };

  const {
    totalSupply: nftTotalsupply,
    totalVolume: nftTotalVolume,
    totalCurrentPP: nftCurrentPP,
    stepPrice: stPrice,
    stepPower: stPower,
    stepEsAXN: stEsAXN,
  } = useTotalMummyClubNftInfo(chainId);

  const currentPrice = nftCurrentPP ? nftCurrentPP._mccPrice : 0;
  const currentPower = nftCurrentPP ? nftCurrentPP._mccPower : 0;
  const currentBonus = nftCurrentPP ? nftCurrentPP._esMMYBonus : 0;

  const stepPrice = stPrice ? stPrice : 0;
  const stepPower = stPower ? stPower : 0;
  const stepEsAXN = stEsAXN ? stEsAXN : 0;

  const nextPrice = nftCurrentPP ? nftCurrentPP._mccPrice.mul(stepPrice).div(bigNumberify(10000)) : 0;
  const nextPower = nftCurrentPP ? nftCurrentPP._mccPower.mul(stepPower).div(bigNumberify(10000)) : 0;
  const netxtBonus = nftCurrentPP ? nftCurrentPP._esMMYBonus.mul(stepEsAXN).div(bigNumberify(10000)) : 0;

  const tokenAddress = getNativeToken().address;
  const tokenAddresses = [tokenAddress];
  const readerAddress = getContract("Reader");

  let nativeTokenBalance;
  const { data: tokenBalances } = useSWR([active, chainId, readerAddress, "getTokenBalances", account], {
    fetcher: contractFetcher(library, Reader, [tokenAddresses]),
  });

  if (tokenBalances !== undefined) nativeTokenBalance = tokenBalances[0];
  else nativeTokenBalance = bigNumberify(0);

  let disalbeMint = false;
  if (isMinting || totalPrice.gte(nativeTokenBalance)) {
    disalbeMint = true;
  } else disalbeMint = false;

  const getError = () => {
    if (totalPrice.gte(nativeTokenBalance)) {
      return t`Max amount exceeded`;
    }
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (isMinting) {
      return t`Minting...`;
    }
    return t`Mint NFT`;
  };

  const onClickMint = () => {
    setIsMinting(true);
    callContract(chainId, saleContract, "mintMummyClub", [nftCount], {
      value: totalPrice,
      sentMsg: t`Mint submitted!`,
      failMsg: t`Mint failed.`,
      setPendingTxns,
    })
      .then(async (res) => {})
      .finally(() => {
        setIsMinting(false);
      });
  };

  const getLatestImageList = async () => {
    const nftAddress = getContract("MummyClubNFT");
    const contract = new ethers.Contract(nftAddress, MummyClubNFT.abi, provider);

    if (contract.address == AddressZero) return;

    const totalSupply = await contract.totalSupply();
    let images = [];
    for (let i = totalSupply; i > 0; i--) {
      const tokenId = await contract.tokenByIndex(i - 1);
      const tokenUri = await contract.tokenURI(tokenId.toString());

      await axios
        .get(tokenUri, {})
        .then((x) => {
          images.push(x.data.image);
        })
        .catch((err) => {
          console.error(err);
        });

      if (images.length > 6) break;
    }

    if (images.length < 5) {
      const diff = 5 - images.length;
      for (let i = 0; i < diff; i++) {
        images.push("");
      }
    }

    setlatestImageList(images);
  };

  function showlatestNfts() {
    return (
      <StyledSlider {...settings}>
        {latestImageList.map((imagePath, index) => (
          <div data-index="-5" tabindex="-1" className="slick-slide slick-cloned" aria-hidden="true">
            <div>
              <div className="nft-mint-item" tabindex="-1">
                <img src={imagePath} alt="nft" />
              </div>
            </div>
          </div>
        ))}
      </StyledSlider>
    );
  }

  const UNIT = NETWORK_METADATA[chainId].nativeCurrency.name;

  useEffect(() => {
    getLatestImageList();
  }, [nftTotalsupply]);

  return shown ? (
    <div>
      <div className="Modal modal-mint">
        <div className="Modal-backdrop" onClick={closeModal}>
          <div
            className="Modal-content"
            onClick={(e) => {
              // do not close modal if anything inside modal content is clicked
              e.stopPropagation();
            }}
          >
            <div className="Modal-title-bar">
              <div className="Modal-title"></div>
              <div className="Modal-close-button">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  fontSize="20"
                  className="Modal-close-icon"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={closeModal}
                >
                  <path fill="none" d="M0 0h24v24H0z"></path>
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
              </div>
            </div>
            <div className="divider"></div>
            <div className="Modal-body DiableScroll-touch-move-container">
              <div className="panel">
                <div className="left">
                  <div className="mobile">
                    <div className="mint-title">Join Tail Club, Earn Reward Together</div>
                    <div className="mint-desc">
                      The earlier you mint, the cheaper the NFT and the higher the power to earn rewards
                      <a href="https://docs.axn.finanace/tail-club" target="blank">
                        Learn More
                        <img src="/static/media/link-white.5228d68c.svg" alt="img" />
                      </a>
                    </div>
                  </div>
                  <img alt="mint" className="mum1" src={mum1} />
                  <div className="info-wrap">
                    <img alt="mint" className="nft-mobile" src={mum1} />
                    <div className="info-container">
                      <div>
                        <div className="label">Total NFT Minted</div>
                        <div className="amount">{formatAmount(nftTotalsupply, 0, 0, true)}</div>
                      </div>
                      <div>
                        <div className="label">Total NFT Supply</div>
                        <div className="amount">{formatAmount(nftTotalsupply, 0, 0, true)}</div>
                      </div>
                      <div>
                        <div className="label">Total Volume</div>
                        <div className="amount">
                          <img src={tokenIcon} alt="img" /> {formatAmount(nftTotalVolume, AXN_DECIMALS, 2, true)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="right">
                  <div className="normal">
                    <div className="mint-title">Join AXN Club, Earn Reward Together</div>
                    <div className="mint-desc">
                      The earlier you mint, the cheaper the NFT and the higher the power to earn rewards.
                      <a href="https://docs.axn.finance/axn-club" target="_blank" rel="noreferrer">
                        Learn More
                        <img src={link_white} alt="img" />
                      </a>
                    </div>
                    <div className="balance-box">
                      <div>
                        <div className="your-balance number-nft"> Number of NFT</div>
                        <MintCountDropdown
                          selectedCount={nftCount}
                          onSelectCount={onSelectCount}
                          price={formatAmount(totalPrice, AXN_DECIMALS, 2, true)}
                        />
                      </div>
                      <div>
                        <div className="your-balance">
                          Avail:
                          <span>
                            {formatAmount(nativeTokenBalance, AXN_DECIMALS, 2, true)} {UNIT}
                          </span>
                        </div>
                        {active && (
                          <button className="btn-mint default-btn" onClick={onClickMint} disabled={disalbeMint}>
                            <img alt="mint" src={mintIcon} /> &nbsp;{getPrimaryText()}
                          </button>
                        )}
                        {!active && (
                          <button className="btn-mint default-btn" onClick={() => connectWallet()}>
                            Connect Wallet
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mint-stats">
                      <div>
                        <div className="first-box">
                          <div className="mint-stats-label">Current Bonus </div>
                          <div className="mint-stats-amount">
                            {formatAmount(currentBonus, AXN_DECIMALS, 2, true)} esAXN
                          </div>
                        </div>
                        <div>
                          <div className="mint-stats-label">
                            Next Bonus
                            <TooltipComponent
                              handle={<img alt="mint" src={icInfo} />}
                              position="right-bottom"
                              renderContent={() => (
                                <span>{t`Bonus decreased by 1% for each group of 100 NFTs minted`}</span>
                              )}
                            />
                          </div>
                          <div className="mint-stats-amount">
                            {formatAmount(netxtBonus, AXN_DECIMALS, 2, true)} esAXN
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="first-box">
                          <div className="mint-stats-label">Current Price</div>
                          <div className="mint-stats-amount">
                            <img src={tokenIcon} alt="img" />
                            {formatAmount(currentPrice, AXN_DECIMALS, 2, true)} {UNIT}
                          </div>
                        </div>
                        <div>
                          <div className="mint-stats-label">
                            Next Price
                            <TooltipComponent
                              handle={<img alt="mint" src={icInfo} />}
                              position="right-bottom"
                              renderContent={() => (
                                <span>{t`Price increases by 1% for each group of 100 NFTs minted`}</span>
                              )}
                            />
                          </div>
                          <div className="mint-stats-amount">
                            <img src={tokenIcon} alt="img" />
                            {formatAmount(nextPrice, AXN_DECIMALS, 2, true)} {UNIT}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="first-box">
                          <div className="mint-stats-label">Current Power</div>
                          <div className="mint-stats-amount">{formatAmount(currentPower, 0, 0, true)} </div>
                        </div>
                        <div>
                          <div className="mint-stats-label">
                            Next Power
                            <TooltipComponent
                              handle={<img alt="mint" src={icInfo} />}
                              position="right-bottom"
                              renderContent={() => (
                                <span>{t`Power decreased by 1% for each group of 100 NFTs minted`}</span>
                              )}
                            />
                          </div>
                          <div className="mint-stats-amount">{formatAmount(nextPower, 0, 0, true)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="last-mint">
                    <div className="last-mint-label">Latest NFT Minted</div>
                    <div className="last-mint-images1">{showlatestNfts()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}

export default NftModal;
