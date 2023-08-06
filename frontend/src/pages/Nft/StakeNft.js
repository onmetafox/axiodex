import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import { Trans } from "@lingui/macro";
import { bigNumberify, formatAmount } from "lib/numbers";
import { contractFetcher } from "lib/contracts";
import { t } from "@lingui/macro";
import { callContract } from "lib/contracts";
// import { useInfoTokens } from "domain/tokens";
import Footer from "components/Footer/Footer";
import "./StakeNft.css";
import SEO from "components/Common/SEO";
import { getPageTitle } from "lib/legacy";
import mum from "img/mum.png";
import mum1 from "img/mum1.png";
import mum2 from "img/mum2.png";
import link_green from "img/link.svg";

import MummyClubStaking from "abis/MummyClubStaking.json"
import MummyClubNFT from "abis/MummyClubNFT.json";
import { useChainId } from "lib/chains";
import { getContract } from "config/contracts";
import { AXN_DECIMALS } from "lib/legacy";

import { useCountdown } from "./useCountdown";

import ItemCard from "./ItemCard"
import { getProvider } from "lib/rpc";
import { ethers } from "ethers";
import axios from 'axios'
import Loader from "components/Common/Loader";

import ftmIcon from "img/ftm.svg";
import maticIcon from "img/ic_bone_24.svg";

import { useTotalMummyClubNftInfo } from "domain/legacy";

import { expandDecimals } from "lib/numbers";

export default function StakeNft({setPendingTxns}) {
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();
  const provider = getProvider(library, chainId);

  const mummyClubAddress = getContract("MummyClubNFT");
  const mummyClubContract = new ethers.Contract(mummyClubAddress, MummyClubNFT.abi, provider);

  const mummyClubStakingAddress = getContract("MummyClubNFTStaking");
  const stakeContract = new ethers.Contract(mummyClubStakingAddress, MummyClubStaking.abi, provider);

  const [metaDatas, setMetaDatas] = useState([]);
  const [initMetaDatas, setInitMetaDatas] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [remainNfts, setRemainNfts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isActingStakeAll, setIsActingStakeAll] = useState(false);
  const [isSubActing, setIsSubActing] = useState(false);
  const [isActingClaim, setIsActingClaim] = useState(false);
  const [tokenIds, setTokenIds] = useState([]);
  const [pageKind, setPageKind] = useState("stake");
  const [selectedTokenId, setSelectedTokenId] = useState(-1);

  const step = 6;

  let totalSupply = 0;

  const { data: totalSakedNFT } = useSWR(
    [active, chainId, mummyClubStakingAddress, "totalSupply"], 
    {
        fetcher: contractFetcher(library, MummyClubStaking),
    }
  );

  const { data: currentEpoch } = useSWR(
    [active, chainId, mummyClubStakingAddress, "epoch"], 
    {
        fetcher: contractFetcher(library, MummyClubStaking),
    }
  );

  const { data: nextEpoch } = useSWR(
    [active, chainId, mummyClubStakingAddress, "nextEpochPoint"], 
    {
        fetcher: contractFetcher(library, MummyClubStaking),
    }
  );

  let targetTime = nextEpoch ? nextEpoch.toString() : 0;
  const [days, hours, minutes, seconds] = useCountdown(targetTime);

  const { data: nextEpochReward } = useSWR(
    [active, chainId, mummyClubStakingAddress, "epochReward"], 
    {
        fetcher: contractFetcher(library, MummyClubStaking),
    }
  );

  const { data: totalDistributed } = useSWR(
    [active, chainId, mummyClubStakingAddress, "totalRewardDistributed"], 
    {
        fetcher: contractFetcher(library, MummyClubStaking),
    }
  );

  const { data: rewardToken } = useSWR(
    [active, chainId, mummyClubStakingAddress, "reward"], 
    {
        fetcher: contractFetcher(library, MummyClubStaking),
    }
  );

  const rewardTokenSymbol = "esAXN"; //getToken(rewardToken).symbol;

  const { data: totalNFTSupply } = useSWR(
    [active, chainId, mummyClubAddress, "totalSupply"], 
    {
        fetcher: contractFetcher(library, MummyClubNFT),
    }
  );

  const { data: userStakedPower } = useSWR(
    [active, chainId, mummyClubStakingAddress, "balances", account], 
    {
        fetcher: contractFetcher(library, MummyClubStaking),
    }
  );

  const { data: userNFTSupply } = useSWR(
    [active, chainId, mummyClubAddress, "balanceOf", account], 
    {
        fetcher: contractFetcher(library, MummyClubNFT),
    }
  );

  const { data: userStakedNFT } = useSWR(
    [active, chainId, mummyClubStakingAddress, "balanceOf", account], 
    {
        fetcher: contractFetcher(library, MummyClubStaking),
    }
  );

  const { data: totalPower } = useSWR(
    [active, chainId, mummyClubStakingAddress, "totalPower"], 
    {
        fetcher: contractFetcher(library, MummyClubStaking),
    }
  );

  if (pageKind === "stake" || pageKind === "approve") {
    if (userNFTSupply)
      totalSupply = userNFTSupply.toString();
  }
  else {
    if (userStakedNFT)
      totalSupply = userStakedNFT.toString();
  }

  const { data: isApproved } = useSWR(
    [active, chainId, mummyClubAddress, "isApprovedForAll", account], 
    {
        fetcher: contractFetcher(library, MummyClubNFT, mummyClubStakingAddress),
    }
  );

  if (isApproved === false ) {
    if (pageKind === "stake") {
      setPageKind("approve");
    }
  }
  else {
    if (pageKind === "approve") {
      setPageKind("stake");
    }
  }

  const { data: earnedInfo } = useSWR(
    [active, chainId, mummyClubStakingAddress, "earned", account], 
    {
        fetcher: contractFetcher(library, MummyClubStaking),
    }
  );

  const userPendingReward = earnedInfo ? earnedInfo : bigNumberify(0)
  const userNextReward = (userStakedPower && nextEpochReward && totalPower) ? userStakedPower.mul(nextEpochReward).div(totalPower) : 0;

  // const { totalSupply: nftTotalsupply, totalVolume: nftTotalVolume } = useTotalMummyClubNftInfo(chainId);
  // const priceNftAsNativeToken = nftTotalsupply ? nftTotalVolume.div(nftTotalsupply) : bigNumberify(0)

  // Calculate user's APR
  // const { infoTokens } = useInfoTokens(library, chainId, active, undefined, undefined);
  // const nativeTokenAddress = getContract("NATIVE_TOKEN");
  // const tokenInfo = infoTokens[nativeTokenAddress];
  // const nativeTokenPrice = tokenInfo ? tokenInfo.minPrice : bigNumberify(0)
  // const priceNftAsUSD = priceNftAsNativeToken.mul(nativeTokenPrice).div(expandDecimals(1, 18))

  // const latestRPS = boardroomHistory(lastIndex).rewardPerShare;
  // const storedRPS = boardroomHistory(userLastIndex).rewardPerShare;

  // const earn = userStakedPower * (latestRPS - storedRPS) / 1e18

  // const myApr =
  //   data.stakedMmyTrackerSupplyUsd && data.stakedMmyTrackerSupplyUsd.gt(0)
  //     ? data.stakedMmyTrackerAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(bigNumberify(userStakedNFT).mul(priceNftAsUSD))
  //     : bigNumberify(0);

  function showNfts() {
    return (
      <div className="yourNfts">
        { 
            metaDatas.map((metadata, index) => (
                <ItemCard imgPath={metadata.image} power={metadata.power} name={metadata.name} tokenId={metadata.tokenId} pageKind={pageKind} 
                    key={index} onSelectAction={onSelectAction} isActing={isSubActing && selectedTokenId === metadata.tokenId} />
            )
          )
        }
      </div>
    );
  }

  const getClaimText = () => {
    if (isActingClaim) {
        return t`Claiming...`;
    }
    return t`Claim`;
  };

  const onClaimReward = async () => {
    setIsActingClaim(true);
    callContract(chainId, stakeContract, "claimReward", [], {
      sentMsg: t`Claim submitted!`,
      failMsg: t`Claim failed.`,
      setPendingTxns,
    })
      .then(async (res) => {
      })
      .finally(() => {
        setIsActingClaim(false);
      });
  };

  const onIncreasePage = async () => {
    setPageNumber(pageNumber + 1);
    setInitMetaDatas(metaDatas);
  };

  const onUnStakePage = async () => {
    setPageNumber(1);
    setMetaDatas([]);
    setRemainNfts(0);
    setPageKind("unStake");
  };

  const onStakePage = async () => {
    setPageNumber(1);
    setMetaDatas([]);
    setRemainNfts(0);
    setPageKind("stake");
  };

  const onStakeAll = async () => {
    setIsActingStakeAll(true);
    if (pageKind === "stake") {
      callContract(chainId, stakeContract, "stake", [tokenIds], {
          sentMsg: t`Stake submitted!`,
          failMsg: t`Stake failed.`,
          setPendingTxns,
      })
          .then(async (res) => {
          })
          .finally(() => {
            setIsActingStakeAll(false);
          });
    }
    else {
      callContract(chainId, stakeContract, "withdraw", [tokenIds], {
        sentMsg: t`UnStake submitted!`,
        failMsg: t`UnStake failed.`,
        setPendingTxns,
      })
        .then(async (res) => {
        })
        .finally(() => {
          setIsActingStakeAll(false);
        });
    }
  };

  const getPrimaryText = () => {
    if (pageKind !== "unStake") {
      if (isActingStakeAll) {
          return t`Staking All...`;
      }
      return t`Stake All`;
    }
    else if (pageKind === "unStake") {
      if (isActingStakeAll) {
        return t`UnStaking All...`;
      }
      return t`UnStake All`;
    }
  };

  const onSelectAction = (tokenId) => {
    setIsSubActing(true);
    setSelectedTokenId(tokenId);

    if (pageKind === "approve") {
      const waitEvent = true
        callContract(chainId, mummyClubContract, "setApprovalForAll", [mummyClubStakingAddress, true], {
            sentMsg: t`Approve submitted!`,
            failMsg: t`Approve failed.`,
            setPendingTxns,
            waitEvent
        })
            .then(async (res) => {
            })
            .finally(() => {
              setIsSubActing(false);
            });
    }
    else if (pageKind === "stake") {
        const tokenIds = [tokenId]
        callContract(chainId, stakeContract, "stake", [tokenIds], {
            sentMsg: t`Stake submitted!`,
            failMsg: t`Stake failed.`,
            setPendingTxns,
        })
            .then(async (res) => {
            })
            .finally(() => {
              setIsSubActing(false);
            });
    }
    else if (pageKind === "unStake") {
        const tokenIds = [tokenId]
        callContract(chainId, stakeContract, "withdraw", [tokenIds], {
            sentMsg: t`UnStake submitted!`,
            failMsg: t`UnStake failed.`,
            setPendingTxns,
        })
            .then(async (res) => {
            })
            .finally(() => {
              setIsSubActing(false);
            });
    }
  };

  const getEstimateAmount = async () => {
    let datas = initMetaDatas;
    if (datas.length >= totalSupply)
        return;

    setLoading(true);

    let tokenIds = [];
    for (let i=(pageNumber - 1) * step; i<pageNumber * step; i++) {
        if (i > totalSupply - 1)
            break;

        let tokenId;
        if (pageKind !== "unStake")
          tokenId = await mummyClubContract.tokenOfOwnerByIndex(account, i);
        else
          tokenId = await stakeContract.tokenOfOwnerByIndex(account, i);


        tokenIds.push(tokenId.toString());
        const tokenUri = await mummyClubContract.tokenURI(tokenId.toString());
        const tokenPower = await mummyClubContract.getTokenPower(tokenId.toString());

        await axios.get(tokenUri, {
            }).then(x => {
                const metadata = {
                    name: x.data.name,
                    image: x.data.image,
                    power: tokenPower.toString(),
                    tokenId: tokenId.toString()
                }

                datas.push(metadata)
            }).catch(err => {
              console.log(err)
            });
    }

    setTokenIds(tokenIds);
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
  }, [pageNumber, totalSupply, pageKind]);

  return (
    <SEO title={getPageTitle("Stake NFT")}>
      <div className="page-layout StakeNft-layout">
        <section className="sc-stakenft">
          <div className="container">
            <div className="title"><Trans>Earn real profit with AXN Club</Trans></div>
            <div className="description">Earn ${rewardTokenSymbol} from platform's collected fees with your NFT</div>
            <div className="roadmap">
              <div className="referral-step">
                <div className="referral-step-line">
                  <div className="line"></div>
                  <div className="step-box">
                    <div className="step-number">1</div>
                    <div className="step-item"><Trans>Get NFT</Trans></div>
                  </div>
                  <div className="step-box">
                    <div className="step-number">2</div>
                    <div className="step-item"><Trans>Stake NFT</Trans></div>
                  </div>
                  <div className="step-box">
                    <div className="step-number">3</div>
                    <div className="step-item"><Trans>Earn reward</Trans></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="stateInfo">
              <div className="epoch-stats">
                <div className="current-epoch">
                  <div className="label"><Trans>Current epoch</Trans></div>
                  <div className="amount">#{formatAmount(currentEpoch, 0, 0, true)}</div>
                </div>
                <div className="stake-nft">
                  <div className="label"><Trans>Staked NFT</Trans></div>
                  <div className="amount"> {formatAmount(totalSakedNFT, 0, 0, true)}/{formatAmount(totalNFTSupply, 0, 0, true)}</div>
                </div>
                <div className="total-reward">
                  <div className="label"><Trans>Total distributed</Trans></div>
                  <div className="amount"> 
                    <img alt="ftm" src={ftmIcon} /> {formatAmount(totalDistributed, AXN_DECIMALS, 2, true)} {rewardTokenSymbol}
                  </div>
                </div>
                <div className="next-epoch">
                  <div className="label"><Trans>Next epoch</Trans></div>
                  <div className="amount">
                    <div className="time-countdown">
                      <div className="time-left">{days}<span>d </span></div> 
                      <div className="space">: </div>
                      <div className="time-left">{hours}<span>h </span></div> 
                      <div className="space">: </div>
                      <div className="time-left">{minutes}<span>m</span> </div> 
                      <div className="space">: </div>
                      <div className="time-left">{seconds}<span>s</span></div>
                    </div>
                  </div>
                </div> 
                <div className="apr">
                  <div className="label"><Trans>Max APR</Trans></div>
                  <div className="amount amount-highlight"> ~43.22%</div>
                </div>
                <div className="next-epoch-reward">
                  <div className="label"><Trans>Next epoch reward</Trans></div>
                  <div className="amount"> 
                    <img alt="ftm" src={ftmIcon} /> {formatAmount(nextEpochReward, AXN_DECIMALS, 2, true)} {rewardTokenSymbol}
                  </div>
                </div>
              </div>
              <div className="yourApr stats-box">
                <div className="label"><Trans>Your staked power</Trans></div>
                <div className="amount amount--large">{formatAmount(userStakedPower, 0, 0, true)}</div>
                <div className="est-apr"><Trans>Est. your APR:</Trans><span className="amount-highlight">~0.00%</span> </div>
              </div>
              <div className="reward stats-box">
                <div>
                  <div className="label"><Trans>Next reward</Trans></div>
                  <div className="amount"><span className="amount-highlight"> {formatAmount(userNextReward, AXN_DECIMALS, 0, true)}</span>{rewardTokenSymbol}</div>
                </div>
                <div>
                  <div className="label"><Trans>Pending reward</Trans></div>
                  <div className="amount "><span className="amount-highlight"> {formatAmount(userPendingReward, AXN_DECIMALS, 0, true)}</span>{rewardTokenSymbol} </div>
                </div>
                <button className="btn-claim default-btn" disabled={isActingClaim || userPendingReward.eq(bigNumberify(0))} 
                        onClick={() => {
                            onClaimReward();
                        }}
                > {getClaimText()}</button>
              </div>
            </div>
            <div className="yourNftPanel">
              <div className="yourNft">
                <div className="amount-nft">
                  <div className="amount-box">
                    <div><Trans>Your NFT: </Trans><span>{formatAmount(userNFTSupply, 0, 0, true)}</span></div>
                    <div><Trans>Your staked NFT: </Trans><span>{formatAmount(userStakedNFT, 0, 0, true)}</span></div>
                  </div>
                </div>
                <div className="head-right">
                  { pageKind !== "unStake" && userStakedNFT && userStakedNFT.gt(bigNumberify(0)) && (
                  <button className="btn-stake"                         
                        onClick={() => {
                            onUnStakePage();
                        }}
                  ><Trans>Go to UnStake</Trans></button>
                  ) }
                  { pageKind === "unStake" && userNFTSupply && userNFTSupply.gt(bigNumberify(0)) && (
                  <button className="btn-stake"                         
                        onClick={() => {
                            onStakePage();
                        }}
                  > <Trans>Go to Stake</Trans></button>
                  ) }
                  { pageKind === "stake"  && userNFTSupply && userNFTSupply.gt(bigNumberify(0)) && ( 
                    <button className="btn-stake" disabled={isActingStakeAll}                      
                          onClick={() => {
                              onStakeAll();
                          }}
                    > {getPrimaryText()}</button>
                  ) }
                  { pageKind === "unStake" && userStakedNFT && userStakedNFT.gt(bigNumberify(0)) && ( 
                    <button className="btn-stake" disabled={isActingStakeAll}                      
                          onClick={() => {
                              onStakeAll();
                          }}
                    > {getPrimaryText()}</button>
                  ) }
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
                        <Trans>Load more</Trans>
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
          </div>
        </section>
        <section className="startApp">
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
