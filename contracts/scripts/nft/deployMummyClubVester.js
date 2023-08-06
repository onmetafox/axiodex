const { deployContract, contractAt, sendTxn } = require("../shared/helpers")

async function main() {
  const name = "Vested TAIL"
  const symbol = "vTAIL"
  const vestingDuration = "31536000"
  const esToken = "0x4E9B05aaDEB0cca6151C0E3b7324C50783892D8A"        // esGmx
  const pairToken = "0x9f528097eFa1CFdEb5EfC3229a2Ee1BA8Dd97A8b"      // UsdcGmx Pair 
  const claimableToken = "0x81bf4C940446f8a6ADa4096FC0Bde8FA39f8c50a" // gmx
  const rewardTracker = "0x20457210e4931929Fd4A2eE59aBCdd9C2A31B3e5"  // stakedGmxTracker

  const mummyClubVesterArgs = [name, symbol, vestingDuration, esToken, pairToken, claimableToken, rewardTracker];

  const mummyClubVester = await deployContract("MummyClubVester", mummyClubVesterArgs)

  const rewardRouterV2 = "0xE7853e02166d88E48FA91FC01235ea52707433ae"
  await sendTxn(mummyClubVester.setHandler(rewardRouterV2, true), "MummyClubVester.setHandler(rewardRouterV2)")

  const mummyClubSale = await contractAt("MummyClubSale", "0x088A733494E3300f64d62cA864b29131D2eda78e");

  await sendTxn(mummyClubVester.setHandler(mummyClubSale.address, true), "MummyClubVester.setHandler(mummyClubSale)")
  await sendTxn(mummyClubSale.setMmyVester(mummyClubVester.address), "mummyClubSale.setMmyVester(mummyClubVester)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
