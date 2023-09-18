import { gql } from "@apollo/client";
import { getServerUrl } from "config/backend";
import { getTokenBySymbol, getWrappedToken } from "config/tokens";
import { getChainlinkChartPricesFromGraph, getChartPricesFromStats, timezoneOffset } from "domain/prices";
import { bigNumberify } from "lib/numbers";
import { getGmxPriceClient } from "lib/subgraph";

function getCurrentBarTimestamp(periodSeconds) {
  return Math.floor(Date.now() / (periodSeconds * 1000)) * (periodSeconds * 1000);
}

export const getTokenChartPrice = async (chainId: number, symbol: string, period: string) => {
  let prices;
  try {
    prices = await getChartPricesFromStats(chainId, symbol, period);
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.warn(ex, "Switching to graph chainlink data");
    try {
      prices = await getChainlinkChartPricesFromGraph(symbol, period);
    } catch (ex2) {
      // eslint-disable-next-line no-console
      console.warn("getChainlinkChartPricesFromGraph failed", ex2);
      prices = [];
    }
  }
  return prices;
};

export async function getCurrentPriceOfToken(chainId: number, symbol: string) {
    const client = getGmxPriceClient(chainId)
    const query = gql`{
      chainlinkPrices(where: {token: $symbol}) {
        price
      }
    }`
    if(client) {
      const result = await client.query({
        query, fetchPolicy: 'no-cache', variables: { symbol }
      })
      return result?.data?.chainlinkPrices?.[0]?.price
    } else {
      return bigNumberify(0);
    }
}

export function fillBarGaps(prices, periodSeconds) {
  if(!prices) return [];

  if (prices.length < 2) return prices;

  const currentBarTimestamp = getCurrentBarTimestamp(periodSeconds) / 1000 + timezoneOffset;
  let lastBar = prices[prices.length - 1];

  if (lastBar.time !== currentBarTimestamp) {
    prices.push({
      ...lastBar,
      time: currentBarTimestamp,
    });
  }

  const newPrices = [prices[0]];
  let prevTime = prices[0].time;

  for (let i = 1; i < prices.length; i++) {
    const { time, open } = prices[i];
    if (prevTime) {
      const numBarsToFill = Math.floor((time - prevTime) / periodSeconds) - 1;
      for (let j = numBarsToFill; j > 0; j--) {
        const newBar = {
          time: time - j * periodSeconds,
          open,
          close: open,
          high: open * 1.0003,
          low: open * 0.9996,
        };
        newPrices.push(newBar);
      }
    }
    prevTime = time;
    newPrices.push(prices[i]);
  }

  return newPrices;
}
