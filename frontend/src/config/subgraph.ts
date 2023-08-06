import { MAINNET, TESTNET, LOCALNET } from "./chains";

export const SUBGRAPH_URLS = {
  [MAINNET]: {
    prices: "http://172.86.96.113/subgraphs/name/prices",
    stats: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats",
    referrals: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-arbitrum-referrals",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },
  [TESTNET]: {
    prices: "http://172.86.96.113/subgraphs/name/prices",
    stats: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats",
    referrals: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-arbitrum-referrals",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },
  [LOCALNET]: {
    prices: "http://172.86.96.113/subgraphs/name/prices",
    stats: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats",
    referrals: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-arbitrum-referrals",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },
  common: {
    chainLink: "https://api.thegraph.com/subgraphs/name/deividask/chainlink",
  },
};
