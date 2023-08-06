const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('../core/tokens')[network];

const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const esGmx = await contractAt("MintableBaseToken", "0x4E9B05aaDEB0cca6151C0E3b7324C50783892D8A");
  const { nativeToken } = tokens

  const mumyClubNFT = "0x3b7b959bfd949f400c8dba2809d6b474715758e5"
  const rewardToken = esGmx.address //nativeToken.address
  const startTime = 1674524920
  const epochLength = 2 * 60 * 60           // 2 hour
  const epochReward = expandDecimals("7400", 18)

  const mummyClubStakingArgs = [mumyClubNFT, rewardToken, startTime, epochLength, epochReward];

  const mummyClubStaking = await deployContract("MummyClubStaking", mummyClubStakingArgs)

  const epochRewardDistributor = await deployContract("EpochRewardDistributor", [mummyClubStaking.address])

  await sendTxn(mummyClubStaking.initialize(epochRewardDistributor.address), "mummyClubStaking.initialize(false)")

  await sendTxn(esGmx.mint(epochRewardDistributor.address, expandDecimals(50000000, 18)), "esGmx.mint(epochRewardDistributor") // ~50,000 GMX per month
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })