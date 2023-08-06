const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('../core/tokens')[network];

async function main() {
  const vestingDuration = 365 * 24 * 60 * 60

  const esGmx = await contractAt("EsGMX", "0x420BF54028C5Eba5Bcd79de8fFb483Dd0D89Db01")
  const bnGmx = await contractAt("MintableBaseToken", "0xbf94B664bfb2aa2DBB36B8274032931aE26C7c87");

  const feeGmxTracker = await contractAt("RewardTracker", "0xBA9138E82c896531630E9855b88B6128E5c105aa")
  const feeGlpTracker = await contractAt("RewardTracker", "0x1418Dd5822D5b0d0f4cEF19015c86f8D7170FE33")

  const stakedGmxTracker = await contractAt("RewardTracker", "0x6a0b457600b9d1d1D65E48B5e438d06d14eF6a1d")
  const stakedGlpTracker = await contractAt("RewardTracker", "0xD5Da733CBd9f24fCFbF584D606e5fca553cd657f")
  const bonusGmxTracker = await contractAt("RewardTracker", "0x4CA14DB39A1F0943e21Bd3b364caA65933F9F73b")

  let distributorAddress = await feeGmxTracker.distributor()
  const feeGmxDistributor = await contractAt("RewardDistributor", distributorAddress)

  distributorAddress = await feeGlpTracker.distributor()
  const feeGlpDistributor = await contractAt("RewardDistributor", distributorAddress)

  distributorAddress = await stakedGmxTracker.distributor()
  const stakedGmxDistributor = await contractAt("RewardDistributor", distributorAddress)

  distributorAddress = await stakedGlpTracker.distributor()
  const stakedGlpDistributor = await contractAt("RewardDistributor", distributorAddress)

  distributorAddress = await bonusGmxTracker.distributor()
  const bonusGmxDistributor = await contractAt("BonusDistributor", distributorAddress)
  
  // await sendTxn(esGmx.setMinter(wallet.address, true), "esGmx.setMinter")
  // await sendTxn(esGmx.mint(stakedGmxDistributor.address, expandDecimals(50000 * 12, 18)), "esGmx.mint(stakedGmxDistributor") // ~50,000 GMX per month
  // await sendTxn(esGmx.mint(stakedGlpDistributor.address, expandDecimals(50000 * 12, 18)), "esGmx.mint(stakedGmxDistributor") // ~50,000 GMX per month

  // await sendTxn(stakedGmxDistributor.setTokensPerInterval("20667989410000000"), "stakedGmxDistributor.setTokensPerInterval") // 0.02066798941 esGmx per second
  // await sendTxn(stakedGlpDistributor.setTokensPerInterval("10667989410000000"), "stakedGlpDistributor.setTokensPerInterval")

  // // mint bnGmx for distributor
  // await sendTxn(bnGmx.setMinter(wallet.address, true), "bnGmx.setMinter")
  // await sendTxn(bnGmx.mint(bonusGmxDistributor.address, expandDecimals(15 * 1000 * 1000, 18)), "bnGmx.mint(bonusGmxDistributor)")

  // Before this tx, please check you have already sent reward token to distributors
  // await sendTxn(feeGmxDistributor.setTokensPerInterval("20000000000"), "feeGmxDistributor.setTokensPerInterval")
  // await sendTxn(feeGlpDistributor.setTokensPerInterval("20000000000"), "feeGlpDistributor.setTokensPerInterval")

  // await sendTxn(stakedGmxTracker.updateRewards(), "stakedGmxTracker.updateRewards")
  // await sendTxn(stakedGlpTracker.updateRewards(), "stakedGlpTracker.updateRewards")
  // await sendTxn(bonusGmxTracker.updateRewards(), "bonusGmxTracker.updateRewards")
  // await sendTxn(feeGmxTracker.updateRewards(), "feeGmxTracker.updateRewards")
  // await sendTxn(feeGlpTracker.updateRewards(), "feeGlpTracker.updateRewards")

  // await sendTxn(stakedGmxDistributor.updateLastDistributionTime(), "stakedGmxTracker.updateLastDistributionTime")
  // await sendTxn(stakedGlpDistributor.updateLastDistributionTime(), "stakedGlpTracker.updateLastDistributionTime")
  // await sendTxn(feeGmxDistributor.updateLastDistributionTime(), "feeGmxTracker.updateLastDistributionTime")
  // await sendTxn(feeGlpDistributor.updateLastDistributionTime(), "feeGlpTracker.updateLastDistributionTime")

  await sendTxn(bonusGmxDistributor.updateLastDistributionTime(), "bonusGmxTracker.updateLastDistributionTime")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

