import { createClient } from "./utils";
import { SUBGRAPH_URLS } from "config/subgraph";
import { LOCALNET, MAINNET, SUPPORTED_CHAIN_IDS, TESTNET } from "config/chains";

export const chainlinkClient = createClient(SUBGRAPH_URLS.common.chainLink);

export const graphClients = SUPPORTED_CHAIN_IDS.reduce((clients, chainId) => ({ ...clients, [chainId]: createClient(SUBGRAPH_URLS[chainId].stats) }), {});
export const priceClients = SUPPORTED_CHAIN_IDS.reduce((clients, chainId) => ({ ...clients, [chainId]: createClient(SUBGRAPH_URLS[chainId].prices) }), {});
export const mainnetReferralClient = createClient(SUBGRAPH_URLS[MAINNET].referrals);
export const mainnetNissohClient = createClient(SUBGRAPH_URLS[MAINNET].nissohVault);

export const testnetReferralClient = createClient(SUBGRAPH_URLS[TESTNET].referrals);
export const testnetNissohClient = createClient(SUBGRAPH_URLS[TESTNET].nissohVault);

export const localnetReferralClient = createClient(SUBGRAPH_URLS[LOCALNET].referrals);
export const localnetNissohClient = createClient(SUBGRAPH_URLS[LOCALNET].nissohVault);

export function getGraphClient(chainId: number) {
  return graphClients[chainId]
}

export function getPriceClient(chainId: number) {
  return priceClients[chainId]
}
