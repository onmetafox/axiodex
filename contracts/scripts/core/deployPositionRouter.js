const { getFrameSigner, deployContract, contractAt , sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function getArbValues(signer) {
  const vault = await contractAt("Vault", "0xAC87f5Bf7892FFF31E10762fb0cE1dCB69e5ac91")
  const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router(), signer)
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const shortsTracker = await contractAt("ShortsTracker", "0xC149996c19C4bEF4c6f3BE6d2Bc5C5d3011194f0", signer)
  const depositFee = "30" // 0.3%
  const minExecutionFee = "100000000000000" // 0.0001 ETH

  return {
    vault,
    timelock,
    router,
    weth,
    shortsTracker,
    depositFee,
    minExecutionFee,
    positionKeepers
  }
}

async function getAvaxValues(signer) {
  const vault = await contractAt("Vault", "0x9ab2De34A33fB459b538c43f251eB825645e8595")
  const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router(), signer)
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const shortsTracker = await contractAt("ShortsTracker", "0x9234252975484D75Fd05f3e4f7BdbEc61956D73a", signer)
  const depositFee = "30" // 0.3%
  const minExecutionFee = "20000000000000000" // 0.02 AVAX

  return {
    vault,
    timelock,
    router,
    weth,
    shortsTracker,
    depositFee,
    minExecutionFee
  }
}

async function getGoerliValues(signer) {
  const vault = await contractAt("Vault", "0x3Fffb9232F2889015eE756f894FbDb9EC85e4B0F")
  const timelock = await contractAt("Timelock", await vault.gov())
  const router = await contractAt("Router", await vault.router())
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const shortsTracker = await contractAt("ShortsTracker", "0xAd550dBa8359E45357D3370Adf6020c17Cf22c82")
  const depositFee = "30" // 0.3%
  const minExecutionFee = "20000000000000000" // 0.02 AVAX

  return {
    vault,
    timelock,
    router,
    weth,
    shortsTracker,
    depositFee,
    minExecutionFee
  }
}

async function getPuppyValues(signer) {
  const vault = await contractAt("Vault", "0xAC87f5Bf7892FFF31E10762fb0cE1dCB69e5ac91")
  const timelock = await contractAt("Timelock", await vault.gov())
  const router = await contractAt("Router", await vault.router())
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const shortsTracker = await contractAt("ShortsTracker", "0xC149996c19C4bEF4c6f3BE6d2Bc5C5d3011194f0")
  const depositFee = "30" // 0.3%
  const minExecutionFee = "20000000000000000" // 0.02 AVAX

  return {
    vault,
    timelock,
    router,
    weth,
    shortsTracker,
    depositFee,
    minExecutionFee
  }
}

async function getFantomValues(signer) {
  const vault = await contractAt("Vault", "0xb9FEAed010Cc37A37f0CDA6eAAEE561Bac7783A8")
  const timelock = await contractAt("Timelock", await vault.gov())
  const router = await contractAt("Router", await vault.router())
  const weth = await contractAt("WFTM", tokens.nativeToken.address)
  const shortsTracker = await contractAt("ShortsTracker", "0x01C77eCD5dfbE4D53A5C0D24852598860c75A072")
  const depositFee = "30" // 0.3%
  const minExecutionFee = "20000000000000000" // 0.02 AVAX

  return {
    vault,
    timelock,
    router,
    weth,
    shortsTracker,
    depositFee,
    minExecutionFee
  }
}

async function getValues(signer) {
  if (network === "arbitrum") {
    return getArbValues(signer)
  }

  if (network === "avax") {
    return getAvaxValues(signer)
  }

  if (network === "goerli") {
    return getGoerliValues(signer)
  }

  if (network === "opera") {
    return getFantomValues(signer)
  }
}

async function main() {
  const signer = await getFrameSigner()

  const {
    vault,
    timelock,
    router,
    weth,
    shortsTracker,
    depositFee,
    minExecutionFee
  } = await getPuppyValues(signer)

  const positionRouterArgs = [vault.address, router.address, weth.address, shortsTracker.address, depositFee, minExecutionFee]
  const positionRouter = await deployContract("PositionRouter", positionRouterArgs)

  await sendTxn(shortsTracker.setHandler(positionRouter.address, true), "shortsTracker.setHandler(positionRouter)")

  await sendTxn(router.addPlugin(positionRouter.address), "router.addPlugin")

  await sendTxn(positionRouter.setDelayValues(1, 180, 30 * 60), "positionRouter.setDelayValues")
  await sendTxn(timelock.setContractHandler(positionRouter.address, true), "timelock.setContractHandler(positionRouter)")

  await sendTxn(positionRouter.setGov(await vault.gov()), "positionRouter.setGov")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
