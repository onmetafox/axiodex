const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getArbValues() {
  const vault = await contractAt("Vault", "0x489ee077994B6658eAfA855C308275EAd8097C4A")
  const tokenManager = { address: "0xddDc546e07f1374A07b270b7d863371e575EA96A" }
  const glpManager = { address: "0x3963FfC9dff443c2A94f21b129D429891E32ec18" }
  const rewardRouter = { address: "0xB95DB5B167D75e6d04227CfFFA61069348d271F5" }

  const gmx = { address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a" }

  return { vault, tokenManager, glpManager, rewardRouter, gmx }
}

async function getAvaxValues() {
  const vault = await contractAt("Vault", "0x9ab2De34A33fB459b538c43f251eB825645e8595")
  const tokenManager = { address: "0x8b25Ba1cAEAFaB8e9926fabCfB6123782e3B4BC2" }
  const glpManager = { address: "0xD152c7F25db7F4B95b7658323c5F33d176818EE4" }
  const rewardRouter = { address: "0xB70B91CE0771d3f4c81D87660f71Da31d48eB3B3" }

  const gmx = { address: "0x62edc0692BD897D2295872a9FFCac5425011c661" }

  return { vault, tokenManager, glpManager, rewardRouter, gmx }
}

async function getGoerliValues() {
  const vault = await contractAt("Vault", "0x3Fffb9232F2889015eE756f894FbDb9EC85e4B0F")
  const tokenManager = { address: "0x2Dd4eCB4b1444dA218243D6Ba7F028A8470e4525" }
  const glpManager = { address: "0xD26314C936eC68311169d8B71aD9032496d8Ea96" }
  const rewardRouter = { address: "0x941Bc7c94edBcA0C1E9B0826b4E090eB36fDE12e" }

  const gmx = { address: "0x0d3A564bcE0739096fE83049F0f7850a3d89e66c" }

  return { vault, tokenManager, glpManager, rewardRouter, gmx }
}

async function getFantomValues() {
  const vault = await contractAt("Vault", "0xb9FEAed010Cc37A37f0CDA6eAAEE561Bac7783A8")
  const tokenManager = { address: "0xb9759E77E3BB19098feb2feC0dCB492a76A9b562" }
  const glpManager = { address: "0x1e3F35825d6481B26D3727D96731FB8c5252B7e2" }
  const rewardRouter = { address: "0xE7853e02166d88E48FA91FC01235ea52707433ae" }

  const gmx = { address: "0x81bf4C940446f8a6ADa4096FC0Bde8FA39f8c50a" }

  return { vault, tokenManager, glpManager, rewardRouter, gmx }
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
  const maxTokenSupply = expandDecimals("13250000", 18)

  const [vault, tokenManager, glpManager, rewardRouter, gmx] = [
    await contractAt("Vault", "0xAC87f5Bf7892FFF31E10762fb0cE1dCB69e5ac91"),
    {address:"0x89a0BA7D5703c98B79445774d34148F5e2B415F5"},
    {address:"0x481B3279FD402d845A1b00864B163BFc46eE2e36"},
    {address:"0xfb93B7fd5aD11C204FfbF3e978f0B24864c14919"},
    {address:"0xe57a247D7997c35c6c6970028A7A7275357876e3"}
  ]
  const mintReceiver = tokenManager

  const timelock = await deployContract("Timelock", [
    admin, // admin
    buffer, // buffer
    tokenManager.address, // tokenManager
    mintReceiver.address, // mintReceiver
    glpManager.address, // glpManager
    rewardRouter.address, // rewardRouter
    maxTokenSupply, // maxTokenSupply
    10, // marginFeeBasisPoints 0.1%
    500 // maxMarginFeeBasisPoints 5%
  ], "Timelock")

  await sendTxn(timelock.setMarginFeeBasisPoints(10, 500), "timelock.setMarginFeeBasisPoints(true)")
  await sendTxn(timelock.setShouldToggleIsLeverageEnabled(true), "timelock.setShouldToggleIsLeverageEnabled(true)")

  // update gov of vault
  await sendTxn(vault.setGov(timelock.address), "Vault.setGov(timelock)")

  const vaultErrorController = await contractAt("VaultErrorController", await vault.errorController())
  const vaultUtility =  await contractAt("VaultUtils", await vault.vaultUtils())

  await sendTxn(vaultErrorController.setGov(timelock.address), "vaultErrorController.setGov(timelock)")
  await sendTxn(vaultUtility.setGov(timelock.address), "vaultUtility.setGov(timelock)")

  const handlers = [
    "0xB4bAc8b01397ACbBCEecf1B1e0871a249DA6D37e", // Camper
    "0xcb2D1CF1ecDeF32a0BFa3C39d74F74AB7454E70B", // Dicapro
    "0x2c215acdA3D070558cF3851AF0Ac7f75B4A233F4", // Dicapro
    signer.address  // Milos
  ]

  for (let i = 0; i < handlers.length; i++) {
    const handler = handlers[i]
    await sendTxn(timelock.setContractHandler(handler, true), `timelock.setContractHandler(${handler})`)
  }

  const keepers = [
    signer.address // X
  ]

  for (let i = 0; i < keepers.length; i++) {
    const keeper = keepers[i]
    await sendTxn(timelock.setKeeper(keeper, true), `timelock.setKeeper(${keeper})`)
  }

  await sendTxn(timelock.signalApprove(gmx.address, admin, "1000000000000000000"), "timelock.signalApprove")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
