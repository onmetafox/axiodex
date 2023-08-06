const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, callWithRetries } = require("../shared/helpers")
const { bigNumberify, expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function getArbValues() {
  const positionContracts = [
    "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868", // PositionRouter
    "0x75E42e6f01baf1D6022bEa862A28774a9f8a4A0C" // PositionManager
  ]

  const { btc, eth, link, uni } = tokens
  const tokenArr = [btc, eth, link, uni]

  return { positionContracts, tokenArr }
}

async function getAvaxValues() {
  const positionContracts = [
    "0xffF6D276Bc37c61A23f06410Dce4A400f66420f8", // PositionRouter
    "0xA21B83E579f4315951bA658654c371520BDcB866" // PositionManager
  ]

  const { avax, eth, btc, btcb } = tokens
  const tokenArr = [avax, eth, btc, btcb]

  return { positionContracts, tokenArr }
}

async function getGoerliValues() {
  const positionContracts = [
    "0x0F99F0d273f239869CB3Ed51968c35d561528f9a", // PositionRouter
    "0xC486044f22B4Da5ae44AdFeE10ee4eFab3826a92" // PositionManager
  ]

  const { eth, btc } = tokens
  const tokenArr = [eth, btc]

  return { positionContracts, tokenArr }
}

async function getFantomValues() {
  const positionContracts = [
    "0xDCc9E6f4b3A0B11645494cc106F1236CD9b59ff6", // PositionRouter
    "0x8009457b27684D98B955022a8F2Cc0973396C7a1" // PositionManager
  ]

  const { ftm, eth, btc } = tokens
  const tokenArr = [ftm, eth, btc]

  return { positionContracts, tokenArr }
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
  const { positionContracts, tokenArr } = await getValues()

  const tokenAddresses = tokenArr.map(t => t.address)
  const longSizes = tokenArr.map((token) => {
    if (!token.maxGlobalLongSize) {
      return bigNumberify(0)
    }

    return expandDecimals(token.maxGlobalLongSize, 30)
  })

  const shortSizes = tokenArr.map((token) => {
    if (!token.maxGlobalShortSize) {
      return bigNumberify(0)
    }

    return expandDecimals(token.maxGlobalShortSize, 30)
  })

  for (let i = 0; i < positionContracts.length; i++) {
    const positionContract = await contractAt("PositionManager", positionContracts[i])
    await sendTxn(positionContract.setMaxGlobalSizes(tokenAddresses, longSizes, shortSizes), "positionContract.setMaxGlobalSizes")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
