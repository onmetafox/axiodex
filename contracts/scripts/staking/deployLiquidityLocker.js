const { getFrameSigner, deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getValues() {
  const timeLock = await contractAt("Timelock", "0x69635940ff9404fedb7B363EAbC67ba3562000B4")
  const lockToken = "0x0937fd9AEAc5049A13325D8b45c61671FBeD14b2";   // UsdcGmxPairToken
  const lockTime = 1681811161;

  return { timeLock, lockToken, lockTime }
}

async function main() {
  const signer = await getFrameSigner()
  const { timeLock, lockToken, lockTime } = await getValues()

  const stakedGlp = await deployContract("LiquidityLocker", [
    timeLock.address,
    lockToken,
    lockTime
  ])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
