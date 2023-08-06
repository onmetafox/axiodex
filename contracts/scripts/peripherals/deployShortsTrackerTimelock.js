const {
  deployContract,
  contractAt,
  sendTxn,
  getFrameSigner
} = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units");
const { getArgumentForSignature } = require("typechain");

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getAvaxValues() {
  return {
    handlers: [
      "0x02270A816FCca45cE078C8b3De0346Eebc90B227", // X Shorts Tracker Keeper
    ]
  }
}

async function getArbValues() {
  return {
    handlers: [
      "0x75f6250b9CeED446b2F25385832dF08DB45a90b0", // X Shorts Tracker Keeper
    ]
  }
}

async function getGoerliValues() {
  return {
    handlers: [
      "0xAd550dBa8359E45357D3370Adf6020c17Cf22c82", // X Shorts Tracker Keeper
    ]
  }
}

async function getFantomValues() {
  return {
    handlers: [
      "0x01C77eCD5dfbE4D53A5C0D24852598860c75A072", // X Shorts Tracker Keeper
    ]
  }
}

async function getValues() {
  return {
    handlers: [
      "0xC149996c19C4bEF4c6f3BE6d2Bc5C5d3011194f0", // X Shorts Tracker Keeper
    ]
  }
}

async function main() {
  const signer = await getFrameSigner()

  const admin = signer.address
  const { handlers } = await getValues()

  const buffer = 60 // 60 seconds
  const updateDelay = 300 // 300 seconds, 5 minutes
  const maxAveragePriceChange = 20 // 0.2%
  let shortsTrackerTimelock = await deployContract("ShortsTrackerTimelock", [admin, buffer, updateDelay, maxAveragePriceChange])
  shortsTrackerTimelock = await contractAt("ShortsTrackerTimelock", shortsTrackerTimelock.address)

  console.log("Setting handlers")
  for (const handler of handlers) {
    await sendTxn(
      shortsTrackerTimelock.setHandler(handler, true),
      `shortsTrackerTimelock.setHandler ${handler}`
    )
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
