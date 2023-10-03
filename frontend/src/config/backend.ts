// export const AXN_STATS_API_URL = "http://localhost:3113/api";
// export const AXN_STATS_API_URL = "https://stats.axnfinance.com/api";

const BACKEND_URLS = {
  // default: "http://localhost:3011/api",
  default: "http://172.86.96.113/api",
};

export function getServerBaseUrl(chainId: number) {
  if (!chainId) {
    throw new Error("chainId is not provided");
  }
  return BACKEND_URLS[chainId] || BACKEND_URLS.default;
}

export function getServerUrl(chainId: number, path: string) {
  return `${getServerBaseUrl(chainId)}${path}`;
}
