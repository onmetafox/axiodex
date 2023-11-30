import React from "react";
import { Trans } from "@lingui/macro";
import Footer from "components/Footer/Footer";
import "./Airdrop.css";
import SEO from "components/Common/SEO";
import { getPageTitle } from "lib/legacy";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { formatEther, parseEther } from 'ethers/lib/utils';
import { set } from "date-fns";
const AirdropAbi = require("abis/Airdrop.json");
const AirdropData = require("../../data/AirdropData.json");

export default function Airdrop() {
  const [claimableAmount, setClaimableAmount] = React.useState("0");
  const [lastClaimTimestamp, setLastClaimTimestamp] = React.useState("0");
  const [claimPeriod, setClaimPeriod] = React.useState("0");
  const [remainingTime, setRemainingTime] = React.useState("");
  const [userInfo, setUserInfo] = React.useState(undefined);
  const [updateInterval, setUpdateInterval] = React.useState(undefined);

  const { active, library, account } = useWeb3React();
  const contractAddress = "0xC0a3832A899a76336e434a816AdDE0267D875b02"


  React.useEffect(() => {
    setClaimableAmount("0")
    setLastClaimTimestamp("0")
    setClaimPeriod("0")
    setRemainingTime("")
    setUserInfo(undefined)
    setUpdateInterval(undefined)

    if (active && library) {
      const userData = AirdropData.users.find((data) => data.address.toLowerCase() === account.toLowerCase());
      setUserInfo(userData)
      //console.log("userData", userData)

      if (userData !== undefined) {
        const contract = new ethers.Contract(contractAddress, AirdropAbi, library.getSigner());
        contract.calculateClaimable(account, userData.value).then((result) => {
          setClaimableAmount(result.toString())

          contract.lastClaimTimestamp(account).then((result) => {
            setLastClaimTimestamp(result.toString())

            contract.claimPeriod().then((result) => {
              setClaimPeriod(result.toString())

              if (updateInterval) {
                clearInterval(updateInterval)
              }

              const myInterval = setInterval(() => {
                calculateRemainingTime(contract).then((result) => {
                })
              }, 1000)
              setUpdateInterval(myInterval)
            })
          })
        })
      }
    }
  }, [account])



  /*
  React.useEffect(() => {
    if (active && library) {

      setClaimableAmount("0")
      setLastClaimTimestamp("0")
      setClaimPeriod("0")
      setRemainingTime("")
      setUserInfo(undefined)
      setUpdateInterval(undefined)


      const contract = new ethers.Contract(contractAddress, AirdropAbi, library.getSigner());
      const userData = AirdropData.users.find((data) => data.address.toLowerCase() === account.toLowerCase());
      setUserInfo(userData)
      //console.log("userData", userData)

      if (userData !== undefined) {
        contract.calculateClaimable(account, userData.value).then((result) => {
          setClaimableAmount(result.toString())
        })

        contract.lastClaimTimestamp(account).then((result) => {
          setLastClaimTimestamp(result.toString())
        })

        contract.claimPeriod().then((result) => {
          setClaimPeriod(result.toString())
        })

        if (updateInterval) {
          clearInterval(updateInterval)
        }

        const myInterval = setInterval(() => {
          calculateRemainingTime(contract).then((result) => {
          })
        }, 1000)
        setUpdateInterval(myInterval)
      }
    }
  }, [active, account])
  */




  async function calculateRemainingTime(contract) {

    const userData = AirdropData.users.find((data) => data.address.toLowerCase() === account.toLowerCase());
    //console.log("userData", userData)

    const claimable = await contract.calculateClaimable(account, userData.value).then((result) => {
      return result.toString()
    })
    setClaimableAmount(claimable)

    const lastClaim = await contract.lastClaimTimestamp(account).then((result) => {
      return result.toString()
    })
    setLastClaimTimestamp(lastClaim)

    const period = await contract.claimPeriod().then((result) => {
      return result.toString()
    })
    setClaimPeriod(period)

    // Current time in Unix timestamp
    const currentTime = Math.floor(Date.now() / 1000);

    // Calculate the time when the user can claim again
    const nextClaimTime = Number(lastClaim) + Number(period);

    // Calculate the difference in seconds
    let timeDiff = nextClaimTime - currentTime;
    /*
    //console.log({
      lastClaim,
      currentTime,
      nextClaimTime,
      timeDiff
    })
    */

    // Ensure that the time difference is not negative
    if (timeDiff < 0) {
      timeDiff = 0;
    }

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(timeDiff / 3600);
    const minutes = Math.floor((timeDiff % 3600) / 60);
    const seconds = timeDiff % 60;

    // Return the time in hh/mm/ss format
    setRemainingTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }



  /*
  const calculateRemainingTime = () => {
    const lastClaimDate = new Date(lastClaimTimestamp * 1000);
    const nextClaimDate = new Date(lastClaimDate.getTime() + claimPeriod * 1000);
    const now = new Date();
    const diff = Math.abs(nextClaimDate.getTime() - now.getTime());
    //console.log("diff", diff)
    const diffDays = Math.ceil(diff / (1000 * 60 * 60));
    //console.log("diffDays", diffDays)
    const hours = 0
    const minutes = 0
    const seconds = 0
    setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
  }
  */


  async function claim() {
    //console.log("account", account)
    const contract = new ethers.Contract(contractAddress, AirdropAbi, library.getSigner());

    const userData = AirdropData.users.find((data) => data.address.toLowerCase() === account.toLowerCase());
    //console.log("userData", userData)

    if (userData) {
      //console.log({
      //  address: userData.address,
      //  value: userData.value,
      //  proof: userData.proof,
      //})

      try {
        const canClaim = await contract.canClaim(userData.address, userData.value, userData.proof);
        //console.log("canClaim", canClaim)

        if (canClaim) {
          await contract.claim(userData.value, userData.proof);
        }
      } catch (error) {
        console.log("error", error)
      }
    }
  }

  return (
    <SEO title={getPageTitle("Claim airdrop")}>
      <div className="BuyGMXGLP page-layout">
        <div className="BuyGMXGLP-container default-container buy">
          <div className="section-title-block">
            <div className="section-title-content">
              <div className="Page-title">
                <p>Claim airdrop</p>
              </div>
            </div>
          </div>
          <div className="Home-token-card-options">
            <div className="Home-token-card-option">
              <div className="Home-token-card-option-info">
                <div className="Home-token-card-option-title">
                  <p>Connect your wallet and click on claim</p>
                </div>
                {userInfo === undefined && (
                  <div className="Home-token-card-option-title">
                    <p style={{ color: "red" }}>You are not on the airdrop list</p>
                  </div>
                )}
                <div className="Home-token-card-option-title">
                  <p>Claimable Amount: {formatEther(claimableAmount)}</p>
                </div>
                {userInfo !== undefined && remainingTime !== "" && (
                  <div className="Home-token-card-option-title">
                    <p>Next claim available in {remainingTime}</p>
                  </div>
                )}


                <div className="Home-token-card-option-action">
                  <div className="buy">
                    <button className="App-cta Exchange-swap-button" onClick={claim} disabled={userInfo === undefined || claimableAmount === "0"}>
                      Claim
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </SEO>
  );
}
