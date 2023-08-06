const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getArbValues() {
  const tokenManager = { address: "0xddDc546e07f1374A07b270b7d863371e575EA96A" }

  return { tokenManager }
}

async function getAvaxValues() {
  const tokenManager = { address: "0x8b25Ba1cAEAFaB8e9926fabCfB6123782e3B4BC2" }

  return { tokenManager }
}

async function getGoerliValues() {
  const tokenManager = { address: "0x2Dd4eCB4b1444dA218243D6Ba7F028A8470e4525" }

  return { tokenManager }
}

async function getFantomValues() {
  const tokenManager = { address: "0xb9759E77E3BB19098feb2feC0dCB492a76A9b562" }

  return { tokenManager }
}

async function getPuppyValues() {
  const tokenManager = { address: "0x89a0BA7D5703c98B79445774d34148F5e2B415F5" }

  return { tokenManager }
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
  const signer = await getFrameSigner()

  const admin = signer.address
  const buffer = 2 * 60; //24 * 60 * 60

  const { tokenManager } = await getPuppyValues()

  const timelock = await deployContract("PriceFeedTimelock", [
    admin,
    buffer,
    tokenManager.address
  ], "Timelock")

  const deployedTimelock = await contractAt("PriceFeedTimelock", timelock.address)

  const signers = [
    "0xB4bAc8b01397ACbBCEecf1B1e0871a249DA6D37e", // Camper
    "0xcb2D1CF1ecDeF32a0BFa3C39d74F74AB7454E70B", // Dicapro
    "0x2c215acdA3D070558cF3851AF0Ac7f75B4A233F4", // Dicapro
    signer.address  // Milos
  ]

  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i]
    await sendTxn(deployedTimelock.setContractHandler(signer, true), `deployedTimelock.setContractHandler(${signer})`)
  }

  const keepers = [
    "0xB4bAc8b01397ACbBCEecf1B1e0871a249DA6D37e", // Camper
    "0xcb2D1CF1ecDeF32a0BFa3C39d74F74AB7454E70B", // Dicapro
    "0x2c215acdA3D070558cF3851AF0Ac7f75B4A233F4", // Dicapro
    signer.address  // Milos
  ]

  for (let i = 0; i < keepers.length; i++) {
    const keeper = keepers[i]
    await sendTxn(deployedTimelock.setKeeper(keeper, true), `deployedTimelock.setKeeper(${keeper})`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
