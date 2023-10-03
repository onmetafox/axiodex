import React from "react";
import { useWeb3React } from "@web3-react/core";
import { Trans } from "@lingui/macro";
import useSWR from "swr";

import Footer from "components/Footer/Footer";
import "./Poll.css";
import SEO from "components/Common/SEO";
import { getPageTitle } from "lib/legacy";
import linkIcon from "img/link.svg";
import axnUsdcIcon from "img/axn-usdc.svg";
import axnEthIcon from "img/axn-eth.svg";
import axnBoneIcon from "img/axn-bone.svg";
import pollBackImage from "img/img_right.svg";
import { getContract } from "config/contracts";
import { useTotalAxnInLiquidity, useTotalFundInLiquidity, useAxnPrice } from "domain/legacy";
import { DEFAULT_DECIMALS, USD_DECIMALS, USDC_DECIMALS, AXN_DECIMALS, shortenAddress } from "lib/legacy";
import { formatAmount, expandDecimals } from "lib/numbers";
import { contractFetcher } from "lib/contracts";
import { getTokenBySymbol } from "config/tokens";
import Vault from "abis/Vault.json";
import { useChainId } from "lib/chains";
import { getExplorerUrl } from "config/chains";

import LiquidityLocker from "abis/LiquidityLocker.json";

export default function Poll() {
  const { chainId } = useChainId();
  const blockExplorer = getExplorerUrl(chainId);

  const { active, library } = useWeb3React();

  let totalGmxInLiquidity;
  let tokenAddress;
  let unit_decimal;
  let tokenName;
  let lpTokenAddress;

  let {
    total: gmxReserve,
  } = useTotalAxnInLiquidity(chainId);

  let pairIcon;
  totalGmxInLiquidity = gmxReserve;

  unit_decimal = USDC_DECIMALS;
  tokenName = "USDC"; /////////????????
  pairIcon = axnUsdcIcon;
  tokenAddress = getTokenBySymbol("USDC").address;

  lpTokenAddress = getContract("UniswapAxnUsdcPool");

  const shortLpTokenAddress = shortenAddress(lpTokenAddress, 13);
  const lpTokenUrl = blockExplorer + "address/" + lpTokenAddress;

  const timeLockAddress = getContract("TimeLock");
  const shortTimeLockAddress = shortenAddress(timeLockAddress, 13);
  const timeLockUrl = blockExplorer + "address/" + timeLockAddress;

  const liquidityLockAddress = getContract("LiquidityLock");
  const shortLiquidityLockAddress = shortenAddress(liquidityLockAddress, 13);
  const liquidityLockUrl = blockExplorer + "address/" + liquidityLockAddress;

  const { gmxPrice } = useAxnPrice(chainId, undefined, active);

  const liquidityLockerAddress = getContract("LiquidityLock");

  const { data: lockUntil } = useSWR([active, chainId, liquidityLockerAddress, "lockUntil"], {
    fetcher: contractFetcher(library, LiquidityLocker),
  });

  let lockDate;
  if (lockUntil) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    const dtf = new Intl.DateTimeFormat("en-US", options);
    lockDate = dtf.format(lockUntil.mul(1000));
  }

  let gmxLiquidityCap;
  if (gmxPrice && totalGmxInLiquidity)
    gmxLiquidityCap = gmxPrice.mul(totalGmxInLiquidity).div(expandDecimals(1, AXN_DECIMALS));

  // Get usdc reserved in the pool
  let { result: tokenReserve } = useTotalFundInLiquidity(chainId);

  const vaultAddress = getContract("Vault");

  const { data: tokenPrice } = useSWR([`StakeV2:usdcPrice`, chainId, vaultAddress, "getMinPrice", tokenAddress], {
    fetcher: contractFetcher(undefined, Vault),
  });

  let tokenLiquidityCap;
  if (tokenPrice && tokenReserve) {
    tokenLiquidityCap = tokenPrice.mul(tokenReserve).div(expandDecimals(1, unit_decimal));
  }

  let totalLiquidityCap;
  if (gmxLiquidityCap && tokenLiquidityCap) {
    totalLiquidityCap = gmxLiquidityCap.add(tokenLiquidityCap);
  }

  return (
    <SEO title={getPageTitle("Proof of Locked Liquidity")}>
      <div className="page-layout Poll-layout">
        <div className="Poll-sublayout">
          <div className="Poll-container">
            <div className="title">
              <Trans>Proof of Locked Liquidity</Trans>
            </div>
            <div>
              <Trans>
                Liquidity is locked by renouncing the ownership of liquidity pool (LP) tokens for a fixed time period,
                by sending them to a time-lock smart contract.
              </Trans>
            </div>
            <div className="link-wrapper">
              <div>
                <div className="label">LP token</div>
                <div className="info">{shortLpTokenAddress}</div>
                <a href={lpTokenUrl} target="_blank" rel="noreferrer">
                  <img src={linkIcon} alt="link" />
                </a>
              </div>
              <div>
                <div className="label">Time lock</div>
                <div className="info"> {shortTimeLockAddress}</div>
                <a href={timeLockUrl} target="_blank" rel="noreferrer">
                  <img src={linkIcon} alt="link" />
                </a>
              </div>
              <div>
                <div className="label">Liquidity lock</div>
                <div className="info"> {shortLiquidityLockAddress}</div>
                <a href={liquidityLockUrl} target="_blank" rel="noreferrer">
                  <img src={linkIcon} alt="link" />
                </a>
              </div>
            </div>
            <div className="liquididy-wrap">
              <div className="liquidity-boxes">
                <div className="liquidity-box">
                  <div className="liquidity-label">Total liquidity locked</div>
                  <div className="liquidity-box-amount txt-green ">
                    ${formatAmount(totalLiquidityCap, USD_DECIMALS, 0, true)}
                  </div>
                </div>
                <div className="liquidity-box">
                  <div className="liquidity-label">Lock until</div>
                  <div className="liquidity-box-amount">{lockDate}</div>
                </div>
              </div>
              <div className="liquidity-pool-wrap">
                <div>
                  <div className="liquidity-label">Pair</div>
                  <div className="liquidity-pool-amount">
                    <img src={pairIcon} alt="img" /> AXN / {tokenName}
                  </div>
                </div>
                <div>
                  <div className="liquidity-label">Pooled AXN</div>
                  <div className="liquidity-pool-amount">
                    {" "}
                    {formatAmount(totalGmxInLiquidity, AXN_DECIMALS, 0, true)}
                    <span className="to-usd">${formatAmount(gmxLiquidityCap, USD_DECIMALS, 0, true)}</span>
                  </div>
                </div>
                <div>
                  <div className="liquidity-label">Pooled {tokenName}</div>
                  <div className="liquidity-pool-amount">
                    {" "}
                    {formatAmount(tokenReserve, unit_decimal, 0, true)}
                    <span className="to-usd">${formatAmount(tokenLiquidityCap, USD_DECIMALS, 0, true)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="Poll-back">
            <img src={pollBackImage} alt="bg" />
          </div>
        </div>
        <Footer />
      </div>
    </SEO>
  );
}
