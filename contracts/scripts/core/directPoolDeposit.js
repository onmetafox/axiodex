const { deployContract, contractAt, sendTxn, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const token = await contractAt("Token", "0xC4Cc77DA23146340de79a0adC809cE5F238b9A2B")
  const router = await contractAt("Router", "0x294CA4eE5BcfB434E804770dE785465eE8075aFF")
  // const amount = expandDecimals(3000, 6)
  const amount = "10000000000000"
  await sendTxn(token.approve(router.address, amount), "router.approve")
  await sendTxn(router.directPoolDeposit(token.address, amount), "router.directPoolDeposit")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
