import { createClient } from "./utils";
import { SUBGRAPH_URLS } from "config/subgraph";
import { MAINNET, TESTNET, LOCALNET } from "config/chains";

export const chainlinkClient = createClient(SUBGRAPH_URLS.common.chainLink);

export const mainnetGraphClient = createClient(SUBGRAPH_URLS[MAINNET].stats);
export const mainnetReferralClient = createClient(SUBGRAPH_URLS[MAINNET].referrals);
export const mainnetNissohClient = createClient(SUBGRAPH_URLS[MAINNET].nissohVault);

export const testnetGraphClient = createClient(SUBGRAPH_URLS[TESTNET].stats);
export const testnetReferralClient = createClient(SUBGRAPH_URLS[TESTNET].referrals);
export const testnetPriceClient = createClient(SUBGRAPH_URLS[TESTNET].prices);
export const testnetOrderClient = createClient(SUBGRAPH_URLS[TESTNET].orders);
export const testnetRawClient = createClient(SUBGRAPH_URLS[TESTNET].raws);
export const testnetNissohClient = createClient(SUBGRAPH_URLS[TESTNET].nissohVault);

export const localnetGraphClient = createClient(SUBGRAPH_URLS[LOCALNET].stats);
export const localnetReferralClient = createClient(SUBGRAPH_URLS[LOCALNET].referrals);
export const localnetNissohClient = createClient(SUBGRAPH_URLS[LOCALNET].nissohVault);

export function getStatsClient(chainId: number) {
  if (chainId === MAINNET) {
    return mainnetGraphClient;
  } else if (chainId === TESTNET) {
    return testnetGraphClient;
  } else if (chainId === LOCALNET) {
    return localnetGraphClient;
  }
  // todo review, commented for allow eth airdrop
  //throw new Error(`Unsupported chain ${chainId}`);
}

export function getPriceClient(chainId: number) {
  if (chainId === MAINNET) {
    return null;
  } else if (chainId === TESTNET) {
    return testnetPriceClient;
  } else if (chainId === LOCALNET) {
    return null;
  }

  // todo review, commented for allow eth airdrop
  //throw new Error(`Unsupported chain ${chainId}`);
}
