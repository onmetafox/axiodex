import { ethers } from "ethers";
import { sample } from "lodash";
import { NetworkMetadata } from "lib/wallets";
// import { isDevelopment } from "./env";

const { parseEther } = ethers.utils;

export const MAINNET = 8453;    // basechain mainnet
export const TESTNET = 84531;   // basechain testnet
export const LOCALNET = 31337;

// TODO take it from web3
export const DEFAULT_CHAIN_ID = TESTNET;
export const CHAIN_ID = DEFAULT_CHAIN_ID;

// export const SUPPORTED_CHAIN_IDS = [ARBITRUM, AVALANCHE, ETHEREUM, SHIBARIUM, GOERLI];

export const IS_NETWORK_DISABLED = {
  [MAINNET]: false,
  [TESTNET]: false,
  [LOCALNET]: true,
};

export const SUPPORTED_CHAIN_IDS = [MAINNET, TESTNET, LOCALNET].filter(chainId => !IS_NETWORK_DISABLED[chainId]);

export const CHAIN_NAMES_MAP = {
  [MAINNET]: "Base",
  [TESTNET]: "Base Goerli",
  [LOCALNET]: "Hardhat",
};

export const GAS_PRICE_ADJUSTMENT_MAP = {
  [MAINNET]: "3000000000",
  [TESTNET]: "3000000000", // 3 gwei
  [LOCALNET]: "3000000000", // 3 gwei
};

export const MAX_GAS_PRICE_MAP = {
  [MAINNET]: "200000000000", // 200 gwei
  [TESTNET]: "200000000000", // 200 gwei
  [LOCALNET]: "200000000000", // 200 gwei
};

export const HIGH_EXECUTION_FEES_MAP = {
  [MAINNET]: 3, // 3 USD
  [TESTNET]: 3, // 3 USD
  [LOCALNET]: 3, // 3 USD
};

const constants = {
  [MAINNET]: {
    nativeTokenSymbol: "WETH",
    defaultCollateralSymbol: "USDC",
    defaultFlagOrdersEnabled: false,
    positionReaderPropsLength: 8,
    v2: true,
  },

  // [TESTNET]: {
  //   nativeTokenSymbol: "PLS",
  //   wrappedTokenSymbol: "WPLS",
  //   defaultCollateralSymbol: "USDC",
  //   defaultFlagOrdersEnabled: true,
  //   positionReaderPropsLength: 8,
  //   v2: true,
  // },
  [TESTNET]: {
    nativeTokenSymbol: "ETH",
    wrappedTokenSymbol: "WETH",
    defaultCollateralSymbol: "USDC",
    defaultFlagOrdersEnabled: true,
    positionReaderPropsLength: 9,
    v2: true,

    SWAP_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
    INCREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
    DECREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.0100001"),
  },

  [LOCALNET]: {
    nativeTokenSymbol: "ETH",
    wrappedTokenSymbol: "WETH",
    defaultCollateralSymbol: "USDC",
    defaultFlagOrdersEnabled: true,
    positionReaderPropsLength: 9,
    v2: true,

    SWAP_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
    INCREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
    DECREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.0100001"),
  },
};

const ALCHEMY_WHITELISTED_DOMAINS = ["axn.finanace", "app.axn.finanace"];

export const RPC_PROVIDERS = {
  [MAINNET]: ["https://rpc.notadegen.com/base"],
  [TESTNET]: ["https://rpc.notadegen.com/base/goerli"],
  [LOCALNET]: ["http://localhost:8545"],
  // [LOCALNET]: ["http://172.86.96.113/rpc/devnet"],
};

export const FALLBACK_PROVIDERS = {
};

export const NETWORK_METADATA: { [chainId: number]: NetworkMetadata } = {
  [MAINNET]: {
    chainId: "0x" + MAINNET.toString(16),
    chainName: CHAIN_NAMES_MAP[MAINNET],
    nativeCurrency: {
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
    },
    rpcUrls: RPC_PROVIDERS[MAINNET],
    blockExplorerUrls: ["https://basescan.org/"],
  },
  [TESTNET]: {
    chainId: "0x" + TESTNET.toString(16),
    chainName: CHAIN_NAMES_MAP[TESTNET],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: RPC_PROVIDERS[TESTNET],
    blockExplorerUrls: ["https://goerli.basescan.org/"],
  },
  [LOCALNET]: {
    chainId: "0x" + LOCALNET.toString(16),
    chainName: CHAIN_NAMES_MAP[LOCALNET],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: RPC_PROVIDERS[LOCALNET],
    blockExplorerUrls: ["http://localhost/"],
  },
};

export const getConstant = (chainId: number, key: string) => {
  if (!constants[chainId]) {
    throw new Error(`Unsupported chainId ${chainId}`);
  }

  if (!(key in constants[chainId])) {
    throw new Error(`Key ${key} does not exist for chainId ${chainId}`);
  }

  return constants[chainId][key];
};

export function getChainName(chainId: number) {
  return CHAIN_NAMES_MAP[chainId];
}

export function getRpcUrl(chainId: number): string | undefined {
  return sample(RPC_PROVIDERS[chainId]);
}

export function getFallbackRpcUrl(chainId: number): string | undefined {
  return sample(FALLBACK_PROVIDERS[chainId]);
}

// export function getAlchemyHttpUrl() {
//   if (ALCHEMY_WHITELISTED_DOMAINS.includes(window.location.host)) {
//     return "https://arb-mainnet.g.alchemy.com/v2/ha7CFsr1bx5ZItuR6VZBbhKozcKDY4LZ";
//   }
//   return "https://arb-mainnet.g.alchemy.com/v2/EmVYwUw0N2tXOuG0SZfe5Z04rzBsCbr2";
// }

// export function getAlchemyWsUrl() {
//   if (ALCHEMY_WHITELISTED_DOMAINS.includes(window.location.host)) {
//     return "wss://arb-mainnet.g.alchemy.com/v2/ha7CFsr1bx5ZItuR6VZBbhKozcKDY4LZ";
//   }
//   return "wss://arb-mainnet.g.alchemy.com/v2/EmVYwUw0N2tXOuG0SZfe5Z04rzBsCbr2";
// }

export function getExplorerUrl(chainId) {
  return NETWORK_METADATA[chainId].blockExplorerUrls[0]
}

export function getHighExecutionFee(chainId) {
  return HIGH_EXECUTION_FEES_MAP[chainId] || 3;
}

export function isSupportedChain(chainId) {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
}
