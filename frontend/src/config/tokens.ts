import { ethers } from "ethers";
import { getContract } from "./contracts";
import { MAINNET, TESTNET, LOCALNET, DEFAULT_CHAIN_ID } from "./chains";
import { Token } from "domain/tokens";
import { ADDRESS_ZERO } from "@uniswap/v3-sdk";

export const TOKENS: Token[] = [
  {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
    address: ethers.constants.AddressZero,
    isNative: true,
    isShortable: false,
    imageUrl: "https://assets.coingecko.com/coins/images/25666/small/11145.png?1653287592",
  },
  // {
  //   name: "Wrapped PLS",
  //   symbol: "WPLS",
  //   decimals: 18,
  //   address: getContract("NATIVE_TOKEN"),
  //   isWrapped: true,
  //   imageUrl: "https://assets.coingecko.com/coins/images/25666/small/11145.png?1653287592",
  // },
  {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 8,
    address: getContract("BTC"),
    isShortable: true,
    imageUrl: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744",
  },
  {
    name: "WETH",
    symbol: "WETH",
    decimals: 18,
    address: getContract("NATIVE_TOKEN"),
    isShortable: true,
    imageUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
  },
  // {
  //   name: "HEX",
  //   symbol: "HEX",
  //   decimals: 18,
  //   address: getContract("HEX"),
  //   isShortable: true,
  //   imageUrl: "https://assets.coingecko.com/coins/images/10103/small/HEX-logo.png?1575942673",
  // },
  {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: getContract("USDC"),
    isStable: true,
    imageUrl: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389",
  },
  // {
  //   name: "USD Gambit",
  //   symbol: "USDG",
  //   decimals: 18,
  //   address: getContract("USDG"),
  //   isUsdg: true,
  //   coingeckoUrl: "https://www.coingecko.com/en/coins/usd-gambit",
  //   imageUrl: "https://assets.coingecko.com/coins/images/15886/small/usdg-02.png",
  // },
]

export const ADDITIONAL_TOKENS: Token[] = [
  {
    name: "PERP",
    symbol: "PERP",
    address: getContract("AXN"),
    decimals: 18,
    imageUrl: "https://assets.coingecko.com/coins/images/18323/small/arbit.png?1631532468",
  },
  {
    name: "Escrowed PERP",
    symbol: "esPERP",
    address: getContract("EsAXN"),
    decimals: 18,
  },
  {
    name: "PERP LP",
    symbol: "PLP",
    address: getContract("ALP"),
    decimals: 18,
    imageUrl: "",
  },
]

export const PLATFORM_TOKENS: { [symbol: string]: Token } = {
  // GMX: {
  //   name: "GMX",
  //   symbol: "GMX",
  //   decimals: 18,
  //   address: getContract("GMX"),
  //   imageUrl: "https://assets.coingecko.com/coins/images/18323/small/arbit.png?1631532468",
  // },
  // GLP: {
  //   name: "GMX LP",
  //   symbol: "GLP",
  //   decimals: 18,
  //   address: getContract("StakedAlpTracker"), // address of fsGLP token because user only holds fsGLP
  //   imageUrl: "",
  // },
};

export const ICONLINKS = {
  GMX: {
    coingecko: "https://www.coingecko.com/en/coins/gmx",
    arbitrum: "https://arbiscan.io/address/0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
  },
  GLP: {
    arbitrum: "https://arbiscan.io/token/0x1aDDD80E6039594eE970E5872D247bf0414C8903",
    reserves: "https://portfolio.nansen.ai/dashboard/gmx?chain=ARBITRUM",
  },
  ETH: {
    coingecko: "https://www.coingecko.com/en/coins/ethereum",
  },
  BTC: {
    coingecko: "https://www.coingecko.com/en/coins/wrapped-bitcoin",
    arbitrum: "https://arbiscan.io/address/0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
  },
  LINK: {
    coingecko: "https://www.coingecko.com/en/coins/chainlink",
    arbitrum: "https://arbiscan.io/address/0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
  },
  UNI: {
    coingecko: "https://www.coingecko.com/en/coins/uniswap",
    arbitrum: "https://arbiscan.io/address/0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
  },
  USDC: {
    coingecko: "https://www.coingecko.com/en/coins/usd-coin",
    arbitrum: "https://arbiscan.io/address/0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
  },
  USDT: {
    coingecko: "https://www.coingecko.com/en/coins/tether",
    arbitrum: "https://arbiscan.io/address/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  },
  DAI: {
    coingecko: "https://www.coingecko.com/en/coins/dai",
    arbitrum: "https://arbiscan.io/address/0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
  },
  MIM: {
    coingecko: "https://www.coingecko.com/en/coins/magic-internet-money",
    arbitrum: "https://arbiscan.io/address/0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a",
  },
  FRAX: {
    coingecko: "https://www.coingecko.com/en/coins/frax",
    arbitrum: "https://arbiscan.io/address/0x17fc002b466eec40dae837fc4be5c67993ddbd6f",
  },
};

export const GLP_POOL_COLORS = {
  ETH: "#6062a6",
  BTC: "#F7931A",
  WBTC: "#F7931A",
  USDC: "#2775CA",
  "USDC.e": "#2A5ADA",
  USDT: "#67B18A",
  MIM: "#9695F8",
  FRAX: "#000",
  DAI: "#FAC044",
  UNI: "#E9167C",
  AVAX: "#E84142",
  LINK: "#3256D6",
  FTM: "#13b5ec",
  BONE: "#fd2139",
};

export const TOKENS_MAP: { [address: string]: Token } = {};
export const TOKENS_BY_SYMBOL_MAP: { [symbol: string]: Token } = {};
// export const WRAPPED_TOKENS_MAP: { [chainId: number]: Token } = {};
// export const NATIVE_TOKENS_MAP: { [chainId: number]: Token } = {};

// const CHAIN_IDS = [MAINNET, TESTNET, LOCALNET];

let tokens = TOKENS;
if (ADDITIONAL_TOKENS) {
  tokens = tokens.concat(ADDITIONAL_TOKENS);
}
for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i];
  TOKENS_MAP[token.address] = token;
  TOKENS_BY_SYMBOL_MAP[token.symbol] = token;
}

// for(const chainId of CHAIN_IDS) {
//   for (const token of TOKENS) {
//     if (token.isWrapped) {
//       WRAPPED_TOKENS_MAP[chainId] = token;
//     } else if (token.isNative) {
//       NATIVE_TOKENS_MAP[chainId] = token;
//     }
//   }
// }

export function getWrappedToken() {
  return TOKENS.find(token => token.isWrapped) ?? TOKENS[1]
}

export function getNativeToken() {
  return TOKENS.find(token => token.isNative) ?? TOKENS[0]
}

export function getTokens() {
  return TOKENS;
}

export function isValidToken(address: string) {
  return address in TOKENS_MAP;
}

export function getToken(address: string) {
  if (!TOKENS_MAP[address]) {
    throw new Error(`Incorrect address "${address}"`);
  }
  return TOKENS_MAP[address];
}

export function getTokenBySymbol(symbol: string) {
  const token = TOKENS_BY_SYMBOL_MAP[symbol];

  if (!token) {
    throw new Error(`Incorrect symbol "${symbol}"`);
  }
  return token;
}

export function getWhitelistedTokens() {
  return TOKENS.filter((token) => token.symbol !== "USDG");
}

export function getVisibleTokens() {
  return getWhitelistedTokens().filter((token) => !token.isWrapped && !token.isTempHidden);
}

export function getNormalizedTokenSymbol(tokenSymbol) {
  if (["WBTC", "WETH", "WAVAX"].includes(tokenSymbol)) {
    return tokenSymbol.substr(1);
  } else if (tokenSymbol === "BTC.b") {
    return "BTC";
  }
  return tokenSymbol;
}

const AVAILABLE_CHART_TOKENS = ["WETH", "BTC", "USDC"]

export function isChartAvailabeForToken(tokenSymbol: string) {
  const token = getTokenBySymbol(tokenSymbol);
  if (!token) return false;
  return (token.isStable || AVAILABLE_CHART_TOKENS.includes(getNormalizedTokenSymbol(tokenSymbol))) ?? false;
}
