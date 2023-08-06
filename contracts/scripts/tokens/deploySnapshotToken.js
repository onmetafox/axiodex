const { deployContract, sendTxn, getFrameSigner } = require("../shared/helpers")

async function main() {
  const wallet = await getFrameSigner()
  const admin = wallet
  const token = await deployContract("SnapshotToken", ["GMX Snapshot 1", "GMX 1", 0])
  await sendTxn(token.setInPrivateTransferMode(true), "token.setInPrivateTransferMode")
  await sendTxn(token.setMinter(admin.address, true), "token.setMinter")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
