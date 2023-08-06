const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function getDistributor(rewardTracker) {
  const distributorAddress = await rewardTracker.distributor()
  return await contractAt("RewardDistributor", distributorAddress)
}

async function printDistributorBalance(token, distributor, label) {
  const balance = await token.balanceOf(distributor.address)
  const pendingRewards = await distributor.pendingRewards()
  console.log(
    label,
    ethers.utils.formatUnits(balance, 18),
    ethers.utils.formatUnits(pendingRewards, 18),
    balance.gte(pendingRewards) ? "sufficient-balance" : "insufficient-balance",
    ethers.utils.formatUnits(balance.sub(pendingRewards), 18)
  )
}

async function main() {
  const gmx = await contractAt("GMX", "0x81bf4C940446f8a6ADa4096FC0Bde8FA39f8c50a")
  const esGmx = await contractAt("EsGMX", "0x4E9B05aaDEB0cca6151C0E3b7324C50783892D8A")
  const bnGmx = await contractAt("MintableBaseToken", "0x7f67061734b78e2ab31f730C72B31EdCA38D7e25")
  const weth = await contractAt("Token", "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889")

  const stakedGmxTracker = await contractAt("RewardTracker", "0x20457210e4931929Fd4A2eE59aBCdd9C2A31B3e5")
  const stakedGmxDistributor = await getDistributor(stakedGmxTracker)

  const bonusGmxTracker = await contractAt("RewardTracker", "0x77F0A0feE1806654eaC6980E0bfF6764ee1c10A9")
  const bonusGmxDistributor = await getDistributor(bonusGmxTracker)

  const feeGmxTracker = await contractAt("RewardTracker", "0x40f057248e4BA492064995D8066aec6B754a67f3")
  const feeGmxDistributor = await getDistributor(feeGmxTracker)

  const stakedGlpTracker = await contractAt("RewardTracker", "0x654F4CF82d3a0B878240262276aFB8eB99cAe216")
  const stakedGlpDistributor = await getDistributor(stakedGlpTracker)

  const feeGlpTracker = await contractAt("RewardTracker", "0x06158CB4Dce4eA438fee783B4f0b123bB03d639C")
  const feeGlpDistributor = await getDistributor(feeGlpTracker)

  await printDistributorBalance(esGmx, stakedGmxDistributor, "esGmx in stakedGmxDistributor:")
  await printDistributorBalance(bnGmx, bonusGmxDistributor, "bnGmx in bonusGmxDistributor:")
  await printDistributorBalance(weth, feeGmxDistributor, "weth in feeGmxDistributor:")
  await printDistributorBalance(esGmx, stakedGlpDistributor, "esGmx in stakedGlpDistributor:")
  await printDistributorBalance(weth, feeGlpDistributor, "esGmx in feeGlpDistributor:")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
