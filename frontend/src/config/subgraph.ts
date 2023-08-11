import { MAINNET, TESTNET, LOCALNET } from "./chains";

export const SUBGRAPH_URLS = {
  [MAINNET]: {
    stats: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats",
    referrals: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-arbitrum-referrals",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },
  [TESTNET]: {
    stats: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats",
    referrals: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-arbitrum-referrals",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },
  [LOCALNET]: {
    stats: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats",
    referrals: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-arbitrum-referrals",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },
  common: {
    chainLink: "https://api.thegraph.com/subgraphs/name/deividask/chainlink",
  },
};
