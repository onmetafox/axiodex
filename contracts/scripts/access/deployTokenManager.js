const { ethers } = require("hardhat")
const { deployContract, contractAt, writeTmpAddresses, sendTxn } = require("../shared/helpers")

async function main() {
  const [wallet] = await ethers.getSigners()
  const tokenManager = await deployContract("TokenManager", [4], "TokenManager")

  const signers = [
    "0xB4bAc8b01397ACbBCEecf1B1e0871a249DA6D37e", // Camper
    "0xcb2D1CF1ecDeF32a0BFa3C39d74F74AB7454E70B", // Dicapro
    "0x2c215acdA3D070558cF3851AF0Ac7f75B4A233F4", // Dicapro
    wallet.address  // Milos
  ]

  await sendTxn(tokenManager.initialize(signers), "tokenManager.initialize")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
