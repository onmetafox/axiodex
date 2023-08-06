const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const secondaryPriceFeed = await contractAt("FastPriceFeed", "0x575Aa1FF3Fc1ff75fB8d0f4FDf6fFe6EeAC7B358")
  // const vaultPriceFeed = await contractAt("VaultPriceFeed", "0x82B1Fa2741a6591D30E61830b1CfDA0E7ba3ABd3")

  await sendTxn(secondaryPriceFeed.setPrices(
    [tokens.btc.address, tokens.eth.address],
    [expandDecimals(27000, 30), expandDecimals(1700, 30)]
  ), "secondaryPriceFeed.setPrices")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
