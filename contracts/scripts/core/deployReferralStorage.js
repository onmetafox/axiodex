const { getFrameSigner, deployContract, contractAt , sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function getArbValues() {
  const vault = await contractAt("Vault", "0x05438563b4Ff6Bab18C00D689c7e5447A4e1C2B1")
  const positionRouter = await contractAt("PositionRouter", "0x3D6bA331e3D9702C5e8A8d254e5d8a285F223aba")
  const positionManager = await contractAt("PositionManager", "0x87a4088Bd721F83b6c2E5102e2FA47022Cb1c831")

  return { vault, positionRouter, positionManager }
}

async function getAvaxValues() {
  const vault = await contractAt("Vault", "0x05438563b4Ff6Bab18C00D689c7e5447A4e1C2B1")
  const positionRouter = await contractAt("PositionRouter", "0x195256074192170d1530527abC9943759c7167d8")
  const positionManager = await contractAt("PositionManager", "0xF2ec2e52c3b5F8b8bd5A3f93945d05628A233216")

  return { vault, positionRouter, positionManager }
}

async function getGoerliValues() {
  const vault = await contractAt("Vault", "0x3Fffb9232F2889015eE756f894FbDb9EC85e4B0F")
  const positionRouter = await contractAt("PositionRouter", "0x0F99F0d273f239869CB3Ed51968c35d561528f9a")
  const positionManager = await contractAt("PositionManager", "0xC486044f22B4Da5ae44AdFeE10ee4eFab3826a92")

  return { vault, positionRouter, positionManager }
}

async function getFantomValues() {
  const vault = await contractAt("Vault", "0xb9FEAed010Cc37A37f0CDA6eAAEE561Bac7783A8")
  const positionRouter = await contractAt("PositionRouter", "0xDCc9E6f4b3A0B11645494cc106F1236CD9b59ff6")
  const positionManager = await contractAt("PositionManager", "0x8009457b27684D98B955022a8F2Cc0973396C7a1")

  return { vault, positionRouter, positionManager }
}

async function getPuppyValues() {
  const vault = await contractAt("Vault", "0xAC87f5Bf7892FFF31E10762fb0cE1dCB69e5ac91")
  const positionRouter = await contractAt("PositionRouter", "0x99507D2CE19E8c8986581b873bAAD48111f3fCd0")
  const positionManager = await contractAt("PositionManager", "0xCd872A9364317939e9fCdCBB227200fe8A90512b")

  return { vault, positionRouter, positionManager }
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
  const { vault, positionRouter, positionManager } = await getPuppyValues()
  const referralStorage = await deployContract("ReferralStorage", [])

  await sendTxn(positionRouter.setReferralStorage(referralStorage.address), "positionRouter.setReferralStorage")
  await sendTxn(positionManager.setReferralStorage(referralStorage.address), "positionManager.setReferralStorage")

  await sendTxn(referralStorage.setHandler(positionRouter.address, true), "ReferralStorage.setHandler(PositionRouter)")

  await sendTxn(referralStorage.setTier(0, 1000, 5000), "referralStorage.setTier 0")
  await sendTxn(referralStorage.setTier(1, 2000, 5000), "referralStorage.setTier 1")
  await sendTxn(referralStorage.setTier(2, 2500, 4000), "referralStorage.setTier 2")

  await sendTxn(referralStorage.setGov(await vault.gov()), "ReferralStorage.setGov")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
