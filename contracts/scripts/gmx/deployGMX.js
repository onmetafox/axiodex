const { ethers } = require("hardhat")
const { deployContract, sendTxn } = require("../shared/helpers")

async function main() {
  const AXN = await deployContract("AXN", [])
  const [wallet] = await ethers.getSigners()

  await sendTxn(AXN.setMinter(wallet.address, true), "AXN.setMinter")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

