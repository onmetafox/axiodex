// import React, { ReactNode, useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import useSWR from "swr";
import { Bar } from 'react-chartjs-2';
import { useWeb3React } from "@web3-react/core";
import { ADDRESS_ZERO } from "@uniswap/v3-sdk";
import { Trans, t } from "@lingui/macro";

import { useHighPricesTokens, useInfoTokens } from "domain/tokens";
// import useTotalVolume from "domain/useTotalVolume";
import { useAxnPrice, useTotalAxnInLiquidity, useTotalAxnStaked, useTotalAxnSupply, useTotalStatInfo, useVolumeStatInfo } from "domain/legacy";

import { gql } from "@apollo/client";
import { useChainId } from "lib/chains";
import { contractFetcher } from "lib/contracts";
import { graphFetcher } from "lib/contracts/graphFetcher";
import { bigNumberify, expandDecimals, formatAmount, formatKeyAmount } from "lib/numbers";
import { BASIS_POINTS_DIVISOR, DEFAULT_MAX_USDG_AMOUNT, AXN_DECIMALS, TLP_DECIMALS, USD_DECIMALS,importImage } from "lib/legacy";

// import AssetDropdown from "./AssetDropdown";
import Button from "components/Button/Button";
import PageRow from "components/PageComponent/PageRow";
import ImgIcon from "components/IconComponent/ImgIcon";
import TooltipComponent from "components/Tooltip/Tooltip";
import ExternalLink from "components/ExternalLink/ExternalLink";
import StatsTooltipRow from "components/StatsTooltip/StatsTooltipRow";


import { getIcon } from "config/icons";
import { getContract } from "config/contracts";
import { getWhitelistedTokens } from "config/tokens";


import VaultV2 from "abis/VaultV2.json";
import ReaderV2 from "abis/ReaderV2.json";
import GlpManager from "abis/GlpManager.json";

import iconAxn from 'img/ic_axn.svg'
import iconLocked from "img/ic_locked.svg";
import iconVolume from "img/ic_volume.svg";
import iconFee from "img/ic_fee.svg";
import iconLogo from "img/ic_logo_70.svg";
import iconLong from "img/ic_long.svg";
import logoIcon from "img/ic_logo.svg";
import iconShort from "img/ic_short.svg";
import iconCalen from "img/ic_calendar.svg";
import iconMlp from "img/ic_mlp-big.svg";
import iconPlus from "img/ic_pls_40.png";
import iconArbi from "img/ic_arbitrum_24.svg";
import iconAval from "img/ic_avalanche_24.svg";
import chatView from "img/trade-chat.svg";

import "./DashboardV3.css";
import { useEffect, useState } from 'react';
import { getPriceClient } from 'lib/subgraph';
import Footer from 'components/Footer/Footer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)
const labels = ['06-10', '06-12', '06-14', '06-16', '06-18', '06-20', '06-22', '06-24', '06-26', '06-28', '06-10', '06-12', '06-14', '06-16', '06-18', '06-20', '06-22', '06-24', '06-26', '06-28'];
export const options = {
  barPercentage: 0.7,
  responsive: true,
  legend: {
    labels: {
        fontColor: "blue",
        fontSize: 18
    }
  },
  scales: {
    y: {
        ticks: {
            fontSize: 15,
            color: '#ffffff'
        },
        grid: {
          borderDash: [10, 10],
          color: "#ddd",
          tickLength: 0, // just to see the dotted line
        }
    },
    x: {
        ticks: {
            color: "#ffffff",
            fontSize: 15,
        },
        grid: {
          display: false,
          color: "#ddd",
          backdropPadding: 3,
          borderWidth: 0.5
        }
    }
  },
  plugins: {
    legend: {
      position: 'left',
      display: false
    },
    title: {
      display: true,
      text: 'Trading Vol.($)',
      font: {
        size: 24,
        weight: 'bold',
      },
      color: '#ffffff',
      position: "top",
      align : 'start',
      padding: 30
    },
  },
};
export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 2',
      data: labels.map(() => Math.random() * (250000 - 100)),
      backgroundColor: '#00FFC2'
    },
  ],
};
export default function DashboardV3() {
  const { active, library } = useWeb3React();
  const { chainId } = useChainId();

  const alpIcon = getIcon(chainId, "alp");
  const baseIcon = getIcon(chainId, "network");

  // const totalVolume = useTotalVolume();

  // const chainName = getChainName(chainId);
  const getWeightText = (tokenInfo) => {
    if (
      !tokenInfo.weight ||
      !tokenInfo.usdgAmount ||
      !adjustedUsdgSupply ||
      adjustedUsdgSupply.eq(0) ||
      !totalTokenWeights
    ) {
      return "...";
    }
  }
  let totalStats = useTotalStatInfo(chainId);
  let volume24H;
  let longOpenInterest;
  let shortOpenInterest;
  let total_Fees;
  let total_Volume;


  if (totalStats != null) {
    volume24H = totalStats.volume24H;
    longOpenInterest = totalStats.longOpenInterest;
    shortOpenInterest = totalStats.shortOpenInterest;
    total_Fees = totalStats.totalFees;
    total_Volume = totalStats.totalVolume;
  }

  let { total: totalGmxSupply } = useTotalAxnSupply(chainId);

  const whitelistedTokens = getWhitelistedTokens();

  const tokenList = whitelistedTokens.filter((t) => !t.isWrapped);
  const visibleTokens = tokenList.filter((t) => !t.isTempHidden);

  const readerAddress = getContract("Reader");
  const vaultAddress = getContract("Vault");
  const glpManagerAddress = getContract("AlpManager");

  const gmxAddress = getContract("AXN");
  const glpAddress = getContract("ALP");
  const usdgAddress = getContract("USDG");

  const tokensForSupplyQuery = [gmxAddress, glpAddress, usdgAddress];

  const { data: aums } = useSWR([`Dashboard:getAums:${active}`, chainId, glpManagerAddress, "getAums"], {
    fetcher: contractFetcher(library, GlpManager),
  });

  const { data: totalSupplies } = useSWR(
    [`Dashboard:totalSupplies:${active}`, chainId, readerAddress, "getTokenBalancesWithSupplies", ADDRESS_ZERO],
    {
      fetcher: contractFetcher(library, ReaderV2, [tokensForSupplyQuery]),
    }
  );

  const { data: totalTokenWeights } = useSWR(
    [`GlpSwap:totalTokenWeights:${active}`, chainId, vaultAddress, "totalTokenWeights"],
    {
      fetcher: contractFetcher(library, VaultV2),
    }
  );

  // Get 24high Prices
  const highPrices = useHighPricesTokens(chainId);
  // Get Open Interest

  // Get info tokens
  const { infoTokens } = useInfoTokens(library, chainId, active, undefined, undefined);
  const { axnPrice } = useAxnPrice(
    chainId,
    undefined,
    active
  );

  let { total: totalGmxInLiquidity } = useTotalAxnInLiquidity(chainId, active);

  let {
    total: totalStakedGmx,
  } = useTotalAxnStaked();

  let gmxMarketCap;
  if (axnPrice && totalGmxSupply) {
    gmxMarketCap = axnPrice.mul(totalGmxSupply).div(expandDecimals(1, AXN_DECIMALS));
  }

  let stakedGmxSupplyUsd;
  if (axnPrice && totalStakedGmx) {
    stakedGmxSupplyUsd = totalStakedGmx.mul(axnPrice).div(expandDecimals(1, AXN_DECIMALS));
  }

  let aum;
  if (aums && aums.length > 0) {
    aum = aums[0].add(aums[1]).div(2);
  }

  let glpPrice;
  let glpSupply;
  let glpMarketCap;
  if (aum && totalSupplies && totalSupplies[3]) {
    glpSupply = totalSupplies[3];
    glpPrice =
      aum && aum.gt(0) && glpSupply.gt(0)
        ? aum.mul(expandDecimals(1, TLP_DECIMALS)).div(glpSupply)
        : expandDecimals(1, USD_DECIMALS);
    glpMarketCap = glpPrice.mul(glpSupply).div(expandDecimals(1, TLP_DECIMALS));
  }

  let tvl;

  if (glpMarketCap && axnPrice && totalStakedGmx) {
    tvl = glpMarketCap.add(axnPrice.mul(totalStakedGmx).div(expandDecimals(1, AXN_DECIMALS)));
  }

  let adjustedUsdgSupply = bigNumberify(0);

  for (let i = 0; infoTokens && infoTokens.length > 0 && i < tokenList.length; i++) {
    const token = tokenList[i];
    const tokenInfo = infoTokens[token.address];
    if (tokenInfo && tokenInfo.usdgAmount) {
      adjustedUsdgSupply = adjustedUsdgSupply.add(tokenInfo.usdgAmount);
    }
  }

  let stakedPercent = 0;

  if (totalGmxSupply && !totalGmxSupply.isZero() && totalStakedGmx && !totalStakedGmx.isZero()) {
    stakedPercent = totalStakedGmx.mul(100).div(totalGmxSupply).toNumber();
  }

  let liquidityPercent = 0;

  if (totalGmxSupply && !totalGmxSupply.isZero() && totalGmxInLiquidity) {
    liquidityPercent = totalGmxInLiquidity.mul(100).div(totalGmxSupply).toNumber();
  }

  let notStakedPercent = 100 - stakedPercent - liquidityPercent;

  // const totalStatsStartDate = chainId === AVALANCHE ? t`06 Jan 2022` : t`01 Apr 2023`;

  let totalGlp = 0;
  let stableGlp = 0;

  let glpPool = infoTokens && infoTokens.length > 0 && tokenList.map((token) => {
    const tokenInfo = infoTokens[token.address];
    if (tokenInfo.usdgAmount && adjustedUsdgSupply && adjustedUsdgSupply.gt(0)) {
      const currentWeightBps = tokenInfo.usdgAmount.mul(BASIS_POINTS_DIVISOR).div(adjustedUsdgSupply);
      if (tokenInfo.isStable) {
        stableGlp += parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`);
      }
      totalGlp += parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`);
      return {
        fullname: token.name,
        name: token.symbol,
        value: parseFloat(`${formatAmount(currentWeightBps, 2, 2, false)}`),
      };
    }
    return null;
  });

  let stablePercentage = totalGlp > 0 ? ((stableGlp * 100) / totalGlp).toFixed(2) : "0.0";

  glpPool = glpPool && glpPool.filter(function (element) {
    return element !== null;
  }).sort(function (a, b) {
    if (a.value < b.value) return 1;
    else return -1;
  });;

  let volumeStats = useVolumeStatInfo(chainId);

  const [volumeStatsData, setVolumeStatsData] = useState();

  useEffect(() => {
    volumeStats.sort((a, b) => {return a.id - b.id});
    let now_str = new Date().toDateString();

    let timezoneOffset = new Date(now_str).getTimezoneOffset();
    let to = new Date(now_str).getTime() - timezoneOffset * 60 * 1000
    let from = to - 60 *60 * 24 * 30 * 1000;

    from = Math.floor(from / 1000);
    to = Math.floor(to / 1000);


    let volumeStatsLabels = [];
    let volumeStatsColumeData = [];

    let index = -1;
    let i = 0;
    for (let d = from ; d <= to ; d += 86400 ) {
      index = volumeStats.findIndex(stat => Number(stat.id) === Number(d));
      if(index > -1) {
        volumeStatsColumeData.push(parseFloat(formatAmount(volumeStats[index].sum, USD_DECIMALS, 2, true).replace(/,/g, '')))
      } else {
        volumeStatsColumeData.push(0)
      }

      if(i % 2 === 0) {
        let cur = new Date(d * 1000)
        let str_m = ("0" + (cur.getMonth() + 1)).substr(-2)
        let str_d = ("0" + cur.getDate()).substr(-2)

        volumeStatsLabels.push(str_m + "-" + str_d);
      } else {
        volumeStatsLabels.push("");
      }
      i ++;
    }

    setVolumeStatsData({
      labels: volumeStatsLabels,
      datasets: [
        {
          label: 'Trading Volume',
          data: volumeStatsColumeData,
          backgroundColor: '#00FFC2'
        },
      ],
    });
  }, [volumeStats])

  return (
    <>
      <div className="BeginAccountTransfer page-layout dashboard">
        <div className="Page-content">
          <div className="row stats-section">
            <div className="Exchange-swap-section strategy-container border-0">
              <div className="Exchange-swap-section-top">
                <div className="strategy-title">Stats</div>
              </div>
              <div className="Exchange-swap-section-bottom strategy-content">
                <div className="row state-group">
                  <ImgIcon icon = {iconLocked} title = "Total Value Locked" value={`$${formatAmount(tvl, USD_DECIMALS, 3, true)}`} className = "col-lg-4 col-md-12 col-sm-12"/>
                  <ImgIcon icon = {iconVolume} title = "Total Volume" value={`$${formatAmount(total_Volume, USD_DECIMALS, 3, true)}`} className = "col-lg-4 col-md-12 col-sm-12"/>
                  <ImgIcon icon = {iconFee} title = "Total Fees" value={`$${formatAmount(total_Fees, USD_DECIMALS, 3, true)}`} className = "col-lg-4 col-md-12 col-sm-12"/>
                </div>

                <div className="row state-group">
                  <ImgIcon icon = {iconLong} title = "Long Positions" value={`$${formatAmount(longOpenInterest, USD_DECIMALS, 3, true)}`} className = "col-lg-4 col-md-12 col-sm-12"/>
                  <ImgIcon icon = {iconShort} title = "Short Positions" value={`$${formatAmount(shortOpenInterest, USD_DECIMALS, 3, true)}`} className = "col-lg-4 col-md-12 col-sm-12"/>
                  <ImgIcon icon = {iconCalen} title = "Fees since 05 Jul 2023" value={`$${formatAmount(total_Fees, USD_DECIMALS, 3, true)}`} className = "col-lg-4 col-md-12 col-sm-12"/>
                </div>
              </div>
              <div className="Exchange-swap-section-bottom strategy-trade">
                {volumeStatsData && <Bar options={options} data = {volumeStatsData}/>}
              </div>
            </div>
          </div>
          <div className="row token-section">
            <div className="token-title">Tokens</div>
            <div className="token-content">
              <div className="Exchange-swap-section strategy-container border-0">
                <div className="Exchange-swap-section-top">
                  <div className="strategy-title"><ImgIcon icon = {iconLogo} title = "AXION" value={`$${formatAmount(axnPrice, USD_DECIMALS, 3, true)}`}/></div>
                  <div className="align-right strategy-link Tab-option">
                    <ExternalLink href="https://docs.axiodex.com/tokenomics" className="strategy-btn">
                      Read more
                    </ExternalLink>
                  </div>
                </div>
                <div className="Exchange-swap-section-bottom strategy-content">
                  <div className="row padding-1r">
                    <div className="col-lg-4 col-md-4 col-sm-12"><PageRow title = "Supply" value={`${formatAmount(totalGmxSupply, AXN_DECIMALS, 0, true)} AXN`} direction = "vertical" className="table-row"/></div>
                    <div className="col-lg-4 col-md-4 col-sm-12"><PageRow title = "Total Staked" value={`$${formatAmount(stakedGmxSupplyUsd, USD_DECIMALS, 2, true)}`} direction = "vertical" className="table-row"/></div>
                    <div className="col-lg-4 col-md-4 col-sm-12"><PageRow title = "Market Cap" value={`$${formatAmount(gmxMarketCap, USD_DECIMALS, 2, true)}`} direction = "vertical" className="table-row"/></div>
                  </div>
                  <div className="row padding-1r">
                    <div className="stats-block">
                      <div className="App-card-row body">
                        <div className="label">
                          <Button imgSrc={baseIcon} ><Trans>Total rewards : <span>55%</span></Trans></Button>
                        </div>
                        <div className="button">
                          <ExternalLink href="https://dashboard.axiodex.com/#/buy" className="strategy-btn green-btn">
                            Buy on Base
                          </ExternalLink>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="Exchange-swap-section strategy-container border-0">
                <div className="Exchange-swap-section-top">
                  <div className="strategy-title"><ImgIcon icon = {alpIcon} title = "ALP" value={`$${formatAmount(glpPrice, USD_DECIMALS, 3, true)}`}/></div>
                  <div className="align-right strategy-link Tab-option">
                    <ExternalLink href="https://docs.axiodex.com/tokenomics" className="strategy-btn">
                      Read more
                    </ExternalLink>
                  </div>
                </div>
                <div className="Exchange-swap-section-bottom strategy-content">
                  <div className="row padding-1r">
                    <div className="col-lg-3 col-md-3 col-sm-12"><PageRow title = "Supply" value={`${formatAmount(glpSupply, TLP_DECIMALS, 0, true)} ALP`} direction = "vertical" className="table-row"/></div>
                    <div className="col-lg-3 col-md-3 col-sm-12"><PageRow title = "Total Staked" value={`$${formatAmount(glpMarketCap, USD_DECIMALS, 2, true)}`} direction = "vertical" className="table-row"/></div>
                    <div className="col-lg-3 col-md-3 col-sm-12"><PageRow title = "Market Cap" value={`$${formatAmount(glpMarketCap, USD_DECIMALS, 2, true)}`} direction = "vertical" className="table-row"/></div>
                    <div className="col-lg-3 col-md-3 col-sm-12"><PageRow title = "Stablecoin Pct." value={`${stablePercentage}%`} direction = "vertical" className="table-row"/></div>
                  </div>
                  <div className="row padding-1r">
                    <div className="stats-block">
                      <div className="App-card-row body">
                        <div className="label">
                        <Button imgSrc={baseIcon} ><Trans>Total rewards : <span>55%</span></Trans></Button>
                        </div>
                        <div className="button">
                          <ExternalLink href="https://dashboard.axiodex.com/#/buy" className="strategy-btn green-btn">
                            Buy on Base
                          </ExternalLink>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row market-section">
            <div className="market-title">Markets</div>
            <div className="market-content table-view">
              <table className="token-table">
                <thead>
                  <tr>
                    <th>
                      <Trans>Pair</Trans>
                    </th>
                    <th>
                      <Trans>Last Price</Trans>
                    </th>
                    <th>
                      <Trans>24 Volume</Trans>
                    </th>
                    <th>
                      <Trans>24 High</Trans>
                    </th>
                    <th>
                      <Trans>24 Change(%)</Trans>
                    </th>
                    <th>
                      <Trans>Total Commitment</Trans>
                    </th>
                    <th>
                      <Trans>Chart</Trans>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTokens.map((token) => {
                    const tokenInfo = infoTokens[token.address];
                    let utilization = bigNumberify(0);
                    if (tokenInfo && tokenInfo.reservedAmount && tokenInfo.poolAmount && tokenInfo.poolAmount.gt(0)) {
                      utilization = tokenInfo.reservedAmount.mul(BASIS_POINTS_DIVISOR).div(tokenInfo.poolAmount);
                    }
                    let maxUsdgAmount = DEFAULT_MAX_USDG_AMOUNT;
                    if (tokenInfo.maxUsdgAmount && tokenInfo.maxUsdgAmount.gt(0)) {
                      maxUsdgAmount = tokenInfo.maxUsdgAmount;
                    }
                    const tokenImage = importImage("ic_" + token.symbol.toLowerCase() + "_40.svg");

                    return (
                      <tr key={token.symbol}>
                        <td>
                          <ImgIcon icon = {tokenImage} title={`${token.name}/USD`} />
                        </td>
                        <td>${formatKeyAmount(tokenInfo, "minPrice", USD_DECIMALS, 2, true)}</td>
                        <td>
                          <TooltipComponent
                            handle={`$${formatKeyAmount(tokenInfo, "managedUsd", USD_DECIMALS, 2, true)}`}
                            position="right-bottom"
                            className="nowrap"
                            renderContent={() => {
                              return (
                                <>
                                  <StatsTooltipRow
                                    label={t`Pool Amount`}
                                    value={`${formatKeyAmount(tokenInfo, "managedAmount", token.decimals, 2, true)} ${
                                      token.symbol
                                    }`}
                                    showDollar={false}
                                  />
                                  <StatsTooltipRow
                                    label={t`Target Min Amount`}
                                    value={`${formatKeyAmount(tokenInfo, "bufferAmount", token.decimals, 2, true)} ${
                                      token.symbol
                                    }`}
                                    showDollar={false}
                                  />
                                  <StatsTooltipRow
                                    label={t`Max ${tokenInfo.symbol} Capacity`}
                                    value={formatAmount(maxUsdgAmount, 18, 2, true)}
                                    showDollar={true}
                                  />
                                </>
                              );
                            }}
                          />
                        </td>
                        <td>${formatAmount(highPrices[token.symbol], 8, 2, true)}</td>
                        <td>{formatAmount(utilization, 2, 2, false)}%</td>
                        <td></td>
                        <td></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="market-content panel-view">
              <div className="token-grid">
                {visibleTokens.map((token) => {
                  const tokenInfo = infoTokens[token.address];
                  let utilization = bigNumberify(0);
                  if (tokenInfo && tokenInfo.reservedAmount && tokenInfo.poolAmount && tokenInfo.poolAmount.gt(0)) {
                    utilization = tokenInfo.reservedAmount.mul(BASIS_POINTS_DIVISOR).div(tokenInfo.poolAmount);
                  }
                  let maxUsdgAmount = DEFAULT_MAX_USDG_AMOUNT;
                  if (tokenInfo.maxUsdgAmount && tokenInfo.maxUsdgAmount.gt(0)) {
                    maxUsdgAmount = tokenInfo.maxUsdgAmount;
                  }

                  const tokenImage = importImage("ic_" + token.symbol.toLowerCase() + "_24.svg");
                  return (
                    <div className="App-card" key={token.symbol}>
                      <div className="App-card-content">
                        <div className="App-card-row">
                          <div className="label">
                            <Trans>Pair</Trans>
                          </div>
                          <div><ImgIcon icon = {tokenImage} title = {`${token.symbol}/USD`} /></div>
                        </div>
                        <div className="App-card-row">
                          <div className="label">
                            <Trans>Last Price</Trans>
                          </div>
                          <div>${formatKeyAmount(tokenInfo, "minPrice", USD_DECIMALS, 2, true)}</div>
                        </div>
                        <div className="App-card-row">
                          <div className="label">
                            <Trans>Pool</Trans>
                          </div>
                          <div>
                            <TooltipComponent
                              handle={`$${formatKeyAmount(tokenInfo, "managedUsd", USD_DECIMALS, 2, true)}`}
                              position="right-bottom"
                              renderContent={() => {
                                return (
                                  <>
                                    <StatsTooltipRow
                                      label={t`Pool Amount`}
                                      value={`${formatKeyAmount(tokenInfo, "managedAmount", token.decimals, 2, true)} ${
                                        token.symbol
                                      }`}
                                      showDollar={false}
                                    />
                                    <StatsTooltipRow
                                      label={t`Target Min Amount`}
                                      value={`${formatKeyAmount(tokenInfo, "bufferAmount", token.decimals, 2, true)} ${
                                        token.symbol
                                      }`}
                                      showDollar={false}
                                    />
                                    <StatsTooltipRow
                                      label={t`Max ${tokenInfo.symbol} Capacity`}
                                      value={formatAmount(maxUsdgAmount, 18, 2, true)}
                                    />
                                  </>
                                );
                              }}
                            />
                          </div>
                        </div>
                        <div className="App-card-row">
                          <div className="label">
                            <Trans>24 High</Trans>
                          </div>
                          <div>${formatAmount(highPrices[token.symbol], 8, 2, false)}</div>
                        </div>
                        <div className="App-card-row">
                          <div className="label">
                            <Trans>24 Change(%)</Trans>
                          </div>
                          <div>{formatAmount(utilization, 2, 2, false)}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>

  )
}
