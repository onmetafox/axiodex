const { getFrameSigner, deployContract, contractAt , sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")


async function main() {
  const signer = await getFrameSigner()
  const deployer = signer

  const glp = await contractAt("GLP", "0xcd65Ac83b9A518537aD286BEB5df5477ce17B0BF")
  const usdg = await contractAt("USDG", "0x8Bf45Af7cBF488a5f47Ee42E55427E4f4B3F3042")

  await sendTxn(glp.mint(deployer.address, expandDecimals(100, 18)), "gmx.mint")
  await sendTxn(usdg.mint(deployer.address, expandDecimals(200, 18)), "gmx.mint")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
