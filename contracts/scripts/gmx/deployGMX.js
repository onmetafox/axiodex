const { ethers } = require("hardhat")
const { deployContract, sendTxn } = require("../shared/helpers")

async function main() {
  const gmx = await deployContract("GMX", [])
  const [wallet] = await ethers.getSigners()

  await sendTxn(gmx.setMinter(wallet.address, true), "gmx.setMinter")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

