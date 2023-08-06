const { deployContract, contractAt, sendTxn, readTmpAddresses, callWithRetries } = require("../shared/helpers")
const { bigNumberify, expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function getArbValues() {
  const vault = await contractAt("Vault", "0x489ee077994B6658eAfA855C308275EAd8097C4A")
  const timelock = await contractAt("Timelock", await vault.gov())

  const { btc, eth, usdc, link, uni, usdt, mim, frax, dai } = tokens
  const tokenArr = [ btc, eth, usdc, link, uni, usdt, frax, dai ]

  return { vault, timelock, reader, tokenArr }
}

async function getAvaxValues() {
  const vault = await contractAt("Vault", "0x05438563b4Ff6Bab18C00D689c7e5447A4e1C2B1")
  const timelock = await contractAt("Timelock", await vault.gov())

  const { avax, eth, btcb, btc, usdc, usdce } = tokens
  const tokenArr = [ avax, eth, btcb, btc, usdc, usdce ]

  return { vault, timelock, tokenArr }
}

async function getGoerliValues() {
  const vault = await contractAt("Vault", "0x3Fffb9232F2889015eE756f894FbDb9EC85e4B0F")
  // const timelock = await contractAt("Timelock", await vault.gov())

  const timelock = await contractAt("Timelock", "0x69635940ff9404fedb7B363EAbC67ba3562000B4")

  const { eth, btc, usdc } = tokens
  const tokenArr = [ eth, btc, usdc ]

  return { vault, timelock, tokenArr }
}

async function getFantomValues() {
  const vault = await contractAt("Vault", "0xb9FEAed010Cc37A37f0CDA6eAAEE561Bac7783A8")
  const timelock = await contractAt("Timelock", await vault.gov())

  const { ftm, eth, btc, usdc, usdt } = tokens
  const tokenArr = [ ftm, eth, btc, usdc, usdt ]

  return { vault, timelock, tokenArr }
}

async function getValues() {
  if (network === "arbitrum") {
    return getArbValues()
  }

  if (network === "avax") {
    return getAvaxValues()
  }

  if (network === "goerli") {
    return getGoerliValues()
  }

  if (network === "opera") {
    return getFantomValues()
  }
}

async function main() {
  const { vault, timelock, tokenArr } = await getValues()

  for (const [i, tokenItem] of tokenArr.entries()) {
      await sendTxn(timelock.setMaxGlobalShortSize(
        vault.address,
        tokenItem.address, // _token
        expandDecimals(20000, 30)   //         20000000000000000000000000000000000
      ), `vault.setMaxGlobalShortSize(${tokenItem.name}) ${tokenItem.address}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
