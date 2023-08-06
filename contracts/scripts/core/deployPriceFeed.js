const { getFrameSigner, deployContract, contractAt , sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units");
const { ethers, network } = require("hardhat");

const tokens = require('./tokens')[network.name];

async function getValues(signer) {
  console.log(tokens)
  const { bone, btc, eth, usdc, usdt } = tokens
  const tokenArr = [ftm, btc, eth, usdc, usdt]
  const fastPriceTokens = [ftm, btc, eth, usdc, usdt]

  const wallet = signer
  const priceFeedTimelock = { address: "0x929A6d74adCe26ebef3AC9Ac37737236230aC38e" }

  const updater1 = { address: "0x2b249Bec7c3A142431b67e63A1dF86F974FAF3aa" }
  const updater2 = { address: "0x63ff41E44d68216e716d236E2ECdd5272611D835" }
  const keeper1 = { address: "0x5e0338CE6597FCB9404d69F4286194A60aD442b7" }
  const keeper2 = wallet
  const updaters = [updater1.address, updater2.address, keeper1.address, keeper2.address]

  const tokenManager = { address: "0x89a0BA7D5703c98B79445774d34148F5e2B415F5" }

  const positionRouter = await contractAt("PositionRouter", "0x99507D2CE19E8c8986581b873bAAD48111f3fCd0")

  const vaultPriceFeed = await contractAt("VaultPriceFeed", "0x480C14e7C99a95Fe1D0E5c09Bf664e2bC5Ce175A")

  const fastPriceEvents = await deployContract("FastPriceEvents", [])
  
  return {
    fastPriceTokens,
    fastPriceEvents,
    tokenManager,
    positionRouter,
    tokenArr,
    updaters,
    priceFeedTimelock,
    vaultPriceFeed
  }
}

async function main() {
  const [signer] = await ethers.getSigners()
  const deployer = signer

  const {
    fastPriceTokens,
    fastPriceEvents,
    tokenManager,
    positionRouter,
    chainlinkFlags,
    tokenArr,
    updaters,
    priceFeedTimelock,
    vaultPriceFeed
  } = await getValues(signer)
  const signers = [
    "0xB4bAc8b01397ACbBCEecf1B1e0871a249DA6D37e", // Camper
    "0xcb2D1CF1ecDeF32a0BFa3C39d74F74AB7454E70B", // Dicapro
    "0x2c215acdA3D070558cF3851AF0Ac7f75B4A233F4", // Dicapro
    signer.address  // Milos
  ]

  if (fastPriceTokens.find(t => !t.fastPricePrecision)) {
    throw new Error("Invalid price precision")
  }

  if (fastPriceTokens.find(t => !t.maxCumulativeDeltaDiff)) {
    throw new Error("Invalid price maxCumulativeDeltaDiff")
  }

  const secondaryPriceFeed = await deployContract("FastPriceFeed", [
    5 * 60, // _priceDuration
    60 * 60, // _maxPriceUpdateDelay
    1, // _minBlockInterval
    250, // _maxDeviationBasisPoints
    fastPriceEvents.address, // _fastPriceEvents
    deployer.address, // _tokenManager
    positionRouter.address
  ])


  await sendTxn(vaultPriceFeed.setSecondaryPriceFeed(secondaryPriceFeed.address), "vaultPriceFeed.setSecondaryPriceFeed")

  if (chainlinkFlags) {
    await sendTxn(vaultPriceFeed.setChainlinkFlags(chainlinkFlags.address), "vaultPriceFeed.setChainlinkFlags")
  }

  for (const [i, tokenItem] of tokenArr.entries()) {
    if (tokenItem.spreadBasisPoints === undefined) { continue }
    await sendTxn(vaultPriceFeed.setSpreadBasisPoints(
      tokenItem.address, // _token
      tokenItem.spreadBasisPoints // _spreadBasisPoints
    ), `vaultPriceFeed.setSpreadBasisPoints(${tokenItem.name}) ${tokenItem.spreadBasisPoints}`)
  }

  for (const token of tokenArr) {
    await sendTxn(vaultPriceFeed.setTokenConfig(
      token.address, // _token
      token.priceFeed, // _priceFeed
      token.priceDecimals, // _priceDecimals
      token.isStrictStable // _isStrictStable
    ), `vaultPriceFeed.setTokenConfig(${token.name}) ${token.address} ${token.priceFeed}`)
  }

  await sendTxn(secondaryPriceFeed.initialize(1, signers, updaters), "secondaryPriceFeed.initialize")
  await sendTxn(secondaryPriceFeed.setTokens(fastPriceTokens.map(t => t.address), fastPriceTokens.map(t => t.fastPricePrecision)), "secondaryPriceFeed.setTokens")
  await sendTxn(secondaryPriceFeed.setVaultPriceFeed(vaultPriceFeed.address), "secondaryPriceFeed.setVaultPriceFeed")
  await sendTxn(secondaryPriceFeed.setMaxTimeDeviation(60 * 60), "secondaryPriceFeed.setMaxTimeDeviation")
  await sendTxn(secondaryPriceFeed.setSpreadBasisPointsIfInactive(50), "secondaryPriceFeed.setSpreadBasisPointsIfInactive")
  await sendTxn(secondaryPriceFeed.setSpreadBasisPointsIfChainError(500), "secondaryPriceFeed.setSpreadBasisPointsIfChainError")
  await sendTxn(secondaryPriceFeed.setMaxCumulativeDeltaDiffs(fastPriceTokens.map(t => t.address), fastPriceTokens.map(t => t.maxCumulativeDeltaDiff)), "secondaryPriceFeed.setMaxCumulativeDeltaDiffs")
  await sendTxn(secondaryPriceFeed.setPriceDataInterval(1 * 60), "secondaryPriceFeed.setPriceDataInterval")

  await sendTxn(positionRouter.setPositionKeeper(secondaryPriceFeed.address, true), "positionRouter.setPositionKeeper(secondaryPriceFeed)")
  await sendTxn(positionRouter.setPositionKeeper(deployer.address, true), "positionRouter.setPositionKeeper(deployer)")
  await sendTxn(fastPriceEvents.setIsPriceFeed(secondaryPriceFeed.address, true), "fastPriceEvents.setIsPriceFeed")

  await sendTxn(vaultPriceFeed.setGov(priceFeedTimelock.address), "vaultPriceFeed.setGov")
  await sendTxn(secondaryPriceFeed.setGov(priceFeedTimelock.address), "secondaryPriceFeed.setGov")
  await sendTxn(secondaryPriceFeed.setTokenManager(tokenManager.address), "secondaryPriceFeed.setTokenManager")
  await sendTxn(fastPriceEvents.setGov(priceFeedTimelock.address), "fastPriceEvents.setGov")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
