const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const vault = await contractAt("Vault", "0xAC87f5Bf7892FFF31E10762fb0cE1dCB69e5ac91")
  const orderBook = await contractAt("OrderBook", "0x9BaAD4119F3a0876913Ce919278689b54f23f45e")
  await deployContract("OrderExecutor", [vault.address, orderBook.address])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

