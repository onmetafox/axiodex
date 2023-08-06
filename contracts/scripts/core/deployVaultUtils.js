const { getFrameSigner, deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const signer = await getFrameSigner()
  const vault = await contractAt("Vault", "0x05438563b4Ff6Bab18C00D689c7e5447A4e1C2B1")
  const timelock = await contractAt("Timelock", await vault.gov())
  const vaultUtils = await deployContract("VaultUtils", [vault.address])
  await sendTxn(timelock.setVaultUtils(vault.address, vaultUtils.address), "timelock.setVaultUtils")

  // await sendTxn(vault.setVaultUtils(vaultUtils.address), "vault.setVaultUtils")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
