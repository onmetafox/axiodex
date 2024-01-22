import { useCallback, useEffect, useRef, useState } from "react";
import { Trans, t } from "@lingui/macro";
import useSWR from "swr";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { callContract, contractFetcher } from "lib/contracts";
import { PLACEHOLDER_ACCOUNT } from "lib/legacy";
import { useChainId } from "lib/chains";
import { getContract } from "config/contracts";
import Proofs from "config/proofs.json";

import airdropAbi from "abis/Airdrop.json";
import erc20Abi from "abis/ERC20.json";

import { DEFAULT_CHAIN_ID, RPC_PROVIDERS, getRpcUrl } from "config/chains";

const airdropAddress = getContract("AirDrop");
const airdropTokenAddress = getContract("AirDropToken");

const defaultGasAmount = '8000000'
const DEFAULT_PROVIDER = new ethers.providers.JsonRpcProvider(getRpcUrl(DEFAULT_CHAIN_ID), DEFAULT_CHAIN_ID);

export default function AirdropBox({ setPendingTxns, connectWallet }) {
  const { active, library, account, activate } = useWeb3React();
  const { chainId } = useChainId();
  const [ info, setInfo ] = useState()
  const [isClaimed, setIsClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState('');

  const checkClaimed = useCallback(async () => {
    const airdropContract = new ethers.Contract(
      airdropAddress,
      airdropAbi,
      DEFAULT_PROVIDER
    )

    const tx = await airdropContract.claimed(account);
    setIsClaimed(tx);
  }, [account])

  const getAirdropTokenSymbol = useCallback(async () => {
    const tokenContract = new ethers.Contract(
      airdropTokenAddress,
      erc20Abi,
      DEFAULT_PROVIDER
    );
    const tx = await tokenContract.symbol();
    setTokenSymbol(tx);
  }, [])

  const onAirdrop = async ()=>{
    console.log(account, info[0], info[1]);
    if(account && info) {
      try {
        setLoading(true);
        const airdropContract = new ethers.Contract(
          airdropAddress,
          airdropAbi,
          library.getSigner(account)
        )
        callContract(chainId, airdropContract, 'claim', [info[0], info[1]], {
          sendMsg: 'Bridge submitted',
          successMsg: `${ethers.utils.formatEther(info[0])}Tokens Claimed`,
          failMsg: `Claim failed`,
          setPendingTxns
        })
        .then((res) => {
          console.log(res)
          setIsClaimed(true);
        })
        .catch((err) => {setLoading(false);console.error(err)})
        .finally(() => {
          setLoading(false)
          checkClaimed();
        });
      } catch (err) {
        setLoading(false)
        console.error(err)
      }
    }
  }

  function isPrimaryEnabled() {
    return !loading;
  }

  function getPrimaryText() {
    if(loading) return t`Airdroping...`;
    return t`Airdrop`;
  }

  useEffect(()=>{
    if(account) {
      setInfo(Proofs[account])
      checkClaimed();
      getAirdropTokenSymbol();
    }
  }, [account, checkClaimed])

  return (
    <div className="referral-card section-center mt-medium">
      <p className="sub-title">
        {
          active ? (
            isClaimed ? (
              <Trans>Already Claimed</Trans>
            ) : (
              <Trans>
                {info ? `Claimable amount ${ethers.utils.formatEther(info[0])} ${tokenSymbol}` : `None claimable`}
              </Trans>
            )
          ) : ('')
        }
      </p>
      <div className="card-action">
        {active ? (
          isClaimed ? (null) : (
            <button className="App-cta Exchange-swap-button" type="submit" disabled={!isPrimaryEnabled()} onClick={()=>onAirdrop()}>
              {getPrimaryText()}
            </button>
          )
        ) : (
          <button className="App-cta Exchange-swap-button" type="submit" onClick={connectWallet}>
            <Trans>Connect Wallet</Trans>
          </button>
        )}
      </div>
    </div>
  )
}

export function AirdropForm() {

  function getPrimaryText() {
    return t`Airdrop`;
  }

  function isPrimaryEnabled() {
    return true;
  }

  return (
    <form>
      <button className="App-cta Exchange-swap-button" type="submit" disabled={!isPrimaryEnabled()}>
        {getPrimaryText()}
      </button>
    </form>
  )
}
