const { deployContract, contractAt , sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const { nativeToken } = tokens

  const orderBook = await deployContract("OrderBook", []);

  // Arbitrum mainnet addresses
  await sendTxn(orderBook.initialize(
    "0x1D9c37A2655b416d6b25F127F2eEfDb31C39dc6e", // router
    "0xAC87f5Bf7892FFF31E10762fb0cE1dCB69e5ac91", // vault
    nativeToken.address, // weth
    "0x02fc856c698b8CBeaaf8BCab3B211BFCd7E65abb", // usdg
    "10000000000000000", // 0.01 AVAX
    expandDecimals(10, 30) // min purchase token amount usd
  ), "orderBook.initialize");

  writeTmpAddresses({
    orderBook: orderBook.address
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
