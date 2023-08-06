const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const wallet = await getFrameSigner()
  const communityFund = wallet.address
  const esGmx = await contractAt("MintableBaseToken", "0x4E9B05aaDEB0cca6151C0E3b7324C50783892D8A");
  const mummyClubVester = "0x6E3480D6EC39Ec1AAa70F53520F7D682fc4A6347"  //mummyClubVester

  const mummyClubSaleArgs = [communityFund, esGmx.address, mummyClubVester];

  const mummyClubSale = await deployContract("MummyClubSale", mummyClubSaleArgs)

  // allow rewardRouter to stake in stakedGmxTracker
  const price = "50000000000000000"
  const power = 5000
  const esGmxBonus = "388000000000000000000"
  await sendTxn(mummyClubSale.setSaleInfo(price, power, esGmxBonus), "MummyClubSale.setSaleInfo()")
  await sendTxn(mummyClubSale.flipSaleState(), "MummyClubSale.flipSaleState()")

  const mummyClubNFT = await contractAt("MummyClubNFT", await mummyClubSale.mummyClubNFT());
  await sendTxn(mummyClubNFT.setBaseURI("https://tank-dev-metadata.fiberbox.net/tanks/"), "mummyClubNFT.setBaseURI()")

  await sendTxn(esGmx.mint(mummyClubSale.address, expandDecimals(2000000, 18)), "esGmx.mint(stakedGmxDistributor")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
