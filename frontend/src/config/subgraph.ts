import { MAINNET, TESTNET, LOCALNET } from "./chains";

export const SUBGRAPH_URLS = {
  [MAINNET]: {
    stats: "https://api.studio.thegraph.com/query/64033/stats-base/0.0.1",
    referrals: "https://api.studio.thegraph.com/query/64033/referrals-base/0.0.1",
    raws: "https://api.studio.thegraph.com/query/64033/raw-base/0.0.1",
    orders: "https://api.studio.thegraph.com/query/64033/orders-base/0.0.1",
    prices: "https://api.studio.thegraph.com/query/64033/prices-base/0.0.417",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },
  [TESTNET]: {
    // stats: "https://api.studio.thegraph.com/query/44624/stats-base-goerli/version/latest",
    stats: "https://api.studio.thegraph.com/query/61609/stats-base-goerli/0.0.4",
    // referrals: "https://api.studio.thegraph.com/query/44624/referrals-base-goerli/version/latest",
    referrals: "https://api.studio.thegraph.com/query/61609/referrals-base-goerli/0.0.4",
    // raws: "https://api.studio.thegraph.com/query/44624/raw-base-goerli/version/latest",
    raws: "https://api.studio.thegraph.com/query/61609/raw-base-goerli/0.0.4",
    // orders: "https://api.studio.thegraph.com/query/44624/orders-base-goerli/version/latest",
    orders: "https://api.studio.thegraph.com/query/61609/orders-base-goerli/0.0.4",
    // prices: "https://api.studio.thegraph.com/query/44624/prices-base-goerli/version/latest",
    prices: "https://api.studio.thegraph.com/query/44624/prices-base-goerli/0.0.4",
    // prices: "https://api.studio.thegraph.com/query/61609/oracle-base-goerli/0.0.4",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },
  [LOCALNET]: {
    stats: "https://api.studio.thegraph.com/query/61609/stats-base-goerli/0.0.4",
    referrals: "https://api.studio.thegraph.com/query/61609/referrals-base-goerli/0.0.4",
    raws: "https://api.studio.thegraph.com/query/61609/raw-base-goerli/0.0.4",
    orders: "https://api.studio.thegraph.com/query/61609/orders-base-goerli/0.0.4",
    prices: "https://api.studio.thegraph.com/query/61609/oracle-base-goerli/0.0.4",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },
  common: {
    chainLink: "https://api.thegraph.com/subgraphs/name/deividask/chainlink",
  },
};
