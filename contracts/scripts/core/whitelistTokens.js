const { deployContract, contractAt, sendTxn, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const vault = await contractAt("Vault", "0x3Fffb9232F2889015eE756f894FbDb9EC85e4B0F")
  const vaultPriceFeed = await contractAt("VaultPriceFeed", "0x28E7DDf5F213b35e8879B379bAD5e08622e277D2")
  console.log("vault", vault.address)
  console.log("vaultPriceFeed", vaultPriceFeed.address)

  let tokenArr
  if (network === "polygonMumbai") {
    const { matic, btc, eth, usdc, usdt } = tokens
    tokenArr = [matic, btc, eth, usdc, usdt]
  }

  if (network === "opera") {
    const { ftm, btc, eth, usdc, usdt } = tokens
    tokenArr = [ftm, btc, eth, usdc, usdt]
  }

  if (network === "goerli") {
    const { btc, eth, usdc } = tokens
    tokenArr = [btc, eth, usdc]
  }

  for (const token of tokenArr) {
    await sendTxn(vaultPriceFeed.setTokenConfig(
      token.address, // _token
      token.priceFeed, // _priceFeed
      token.priceDecimals, // _priceDecimals
      token.isStrictStable // _isStrictStable
    ), `vaultPriceFeed.setTokenConfig(${token.name}) ${token.address} ${token.priceFeed}`)

    await sendTxn(vault.setTokenConfig(
      token.address, // _token
      token.decimals, // _tokenDecimals
      token.tokenWeight, // _tokenWeight
      token.minProfitBps, // _minProfitBps
      expandDecimals(token.maxUsdgAmount, 18), // _maxUsdgAmount
      token.isStable, // _isStable
      token.isShortable // _isShortable
    ), `vault.setTokenConfig(${token.name}) ${token.address}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
