import { MAINNET, TESTNET, LOCALNET } from "./chains";

export const SUBGRAPH_URLS = {
  [MAINNET]: {
    stats: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats",
    referrals: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-arbitrum-referrals",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },
  [TESTNET]: {
    stats: "https://api.studio.thegraph.com/query/44624/stats-base-goerli/version/latest",
    referrals: "https://api.studio.thegraph.com/query/44624/referrals-base-goerli/version/latest",
    raws: "https://api.studio.thegraph.com/query/44624/raw-base-goerli/version/latest",
    orders: "https://api.studio.thegraph.com/query/44624/orders-base-goerli/version/latest",
    prices: "https://api.studio.thegraph.com/query/44624/prices-base-goerli/version/latest",
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
