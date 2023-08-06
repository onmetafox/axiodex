const { deployContract, contractAt, sendTxn, writeTmpAddresses, getFrameSigner } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('../core/tokens')[network];

async function main() {
  const { nativeToken } = tokens

  const vestingDuration = 365 * 24 * 60 * 60

  const glpManager = await contractAt("GlpManager", "0xD26314C936eC68311169d8B71aD9032496d8Ea96")
  const glp = await contractAt("GLP", "0x1173857Eb1d9bDc1a2040bDB3F6a86688A3d1bB8")

  const gmx = await contractAt("GMX", "0x0d3A564bcE0739096fE83049F0f7850a3d89e66c");
  const esGmx = await deployContract("EsGMX", []);
  const bnGmx = await deployContract("MintableBaseToken", ["Bonus GMX", "bnGMX", 0]);

  await sendTxn(esGmx.setInPrivateTransferMode(true), "esGmx.setInPrivateTransferMode")
  await sendTxn(glp.setInPrivateTransferMode(true), "glp.setInPrivateTransferMode")

  const stakedGmxTracker = await deployContract("RewardTracker", ["Staked GMX", "sGMX"])
  const stakedGmxDistributor = await deployContract("RewardDistributor", [esGmx.address, stakedGmxTracker.address])
  await sendTxn(stakedGmxTracker.initialize([gmx.address, esGmx.address], stakedGmxDistributor.address), "stakedGmxTracker.initialize")
  await sendTxn(stakedGmxDistributor.updateLastDistributionTime(), "stakedGmxDistributor.updateLastDistributionTime")

  const bonusGmxTracker = await deployContract("RewardTracker", ["Staked + Bonus GMX", "sbGMX"])
  const bonusGmxDistributor = await deployContract("BonusDistributor", [bnGmx.address, bonusGmxTracker.address])
  await sendTxn(bonusGmxTracker.initialize([stakedGmxTracker.address], bonusGmxDistributor.address), "bonusGmxTracker.initialize")
  await sendTxn(bonusGmxDistributor.updateLastDistributionTime(), "bonusGmxDistributor.updateLastDistributionTime")

  const feeGmxTracker = await deployContract("RewardTracker", ["Staked + Bonus + Fee GMX", "sbfGMX"])
  const feeGmxDistributor = await deployContract("RewardDistributor", [nativeToken.address, feeGmxTracker.address])
  await sendTxn(feeGmxTracker.initialize([bonusGmxTracker.address, bnGmx.address], feeGmxDistributor.address), "feeGmxTracker.initialize")
  await sendTxn(feeGmxDistributor.updateLastDistributionTime(), "feeGmxDistributor.updateLastDistributionTime")

  const feeGlpTracker = await deployContract("RewardTracker", ["Fee GLP", "fGLP"])
  const feeGlpDistributor = await deployContract("RewardDistributor", [nativeToken.address, feeGlpTracker.address])
  await sendTxn(feeGlpTracker.initialize([glp.address], feeGlpDistributor.address), "feeGlpTracker.initialize")
  await sendTxn(feeGlpDistributor.updateLastDistributionTime(), "feeGlpDistributor.updateLastDistributionTime")

  const stakedGlpTracker = await deployContract("RewardTracker", ["Fee + Staked GLP", "fsGLP"])
  const stakedGlpDistributor = await deployContract("RewardDistributor", [esGmx.address, stakedGlpTracker.address])
  await sendTxn(stakedGlpTracker.initialize([feeGlpTracker.address], stakedGlpDistributor.address), "stakedGlpTracker.initialize")
  await sendTxn(stakedGlpDistributor.updateLastDistributionTime(), "stakedGlpDistributor.updateLastDistributionTime")

  await sendTxn(stakedGmxTracker.setInPrivateTransferMode(true), "stakedGmxTracker.setInPrivateTransferMode")
  await sendTxn(stakedGmxTracker.setInPrivateStakingMode(true), "stakedGmxTracker.setInPrivateStakingMode")
  await sendTxn(bonusGmxTracker.setInPrivateTransferMode(true), "bonusGmxTracker.setInPrivateTransferMode")
  await sendTxn(bonusGmxTracker.setInPrivateStakingMode(true), "bonusGmxTracker.setInPrivateStakingMode")
  await sendTxn(bonusGmxTracker.setInPrivateClaimingMode(true), "bonusGmxTracker.setInPrivateClaimingMode")
  await sendTxn(feeGmxTracker.setInPrivateTransferMode(true), "feeGmxTracker.setInPrivateTransferMode")
  await sendTxn(feeGmxTracker.setInPrivateStakingMode(true), "feeGmxTracker.setInPrivateStakingMode")

  await sendTxn(feeGlpTracker.setInPrivateTransferMode(true), "feeGlpTracker.setInPrivateTransferMode")
  await sendTxn(feeGlpTracker.setInPrivateStakingMode(true), "feeGlpTracker.setInPrivateStakingMode")
  await sendTxn(stakedGlpTracker.setInPrivateTransferMode(true), "stakedGlpTracker.setInPrivateTransferMode")
  await sendTxn(stakedGlpTracker.setInPrivateStakingMode(true), "stakedGlpTracker.setInPrivateStakingMode")

  const gmxVester = await deployContract("Vester", [
    "Vested GMX", // _name
    "vGMX", // _symbol
    vestingDuration, // _vestingDuration
    esGmx.address, // _esToken
    feeGmxTracker.address, // _pairToken
    gmx.address, // _claimableToken
    stakedGmxTracker.address, // _rewardTracker
  ])

  const glpVester = await deployContract("Vester", [
    "Vested GLP", // _name
    "vGLP", // _symbol
    vestingDuration, // _vestingDuration
    esGmx.address, // _esToken
    stakedGlpTracker.address, // _pairToken
    gmx.address, // _claimableToken
    stakedGlpTracker.address, // _rewardTracker
  ])

  await sendTxn(gmx.mint(gmxVester.address, expandDecimals(40000, 18)), "gmx.mint(gmxVester)")
  await sendTxn(gmx.mint(glpVester.address, expandDecimals(20000, 18)), "gmx.mint(glpVester)")

  const rewardRouter = await deployContract("RewardRouterV2", [])
  await sendTxn(rewardRouter.initialize(
    nativeToken.address,
    gmx.address,
    esGmx.address,
    bnGmx.address,
    glp.address,
    stakedGmxTracker.address,
    bonusGmxTracker.address,
    feeGmxTracker.address,
    feeGlpTracker.address,
    stakedGlpTracker.address,
    glpManager.address,
    gmxVester.address,
    glpVester.address
  ), "rewardRouter.initialize")

  await sendTxn(glpManager.setHandler(rewardRouter.address, true), "glpManager.setHandler(rewardRouter)")

  // allow rewardRouter to stake in stakedGmxTracker
  await sendTxn(stakedGmxTracker.setHandler(rewardRouter.address, true), "stakedGmxTracker.setHandler(rewardRouter)")
  // allow bonusGmxTracker to stake stakedGmxTracker
  await sendTxn(stakedGmxTracker.setHandler(bonusGmxTracker.address, true), "stakedGmxTracker.setHandler(bonusGmxTracker)")
  // allow rewardRouter to stake in bonusGmxTracker
  await sendTxn(bonusGmxTracker.setHandler(rewardRouter.address, true), "bonusGmxTracker.setHandler(rewardRouter)")
  // allow bonusGmxTracker to stake feeGmxTracker
  await sendTxn(bonusGmxTracker.setHandler(feeGmxTracker.address, true), "bonusGmxTracker.setHandler(feeGmxTracker)")
  await sendTxn(bonusGmxDistributor.setBonusMultiplier(10000), "bonusGmxDistributor.setBonusMultiplier")
  // allow rewardRouter to stake in feeGmxTracker
  await sendTxn(feeGmxTracker.setHandler(rewardRouter.address, true), "feeGmxTracker.setHandler(rewardRouter)")
  // allow stakedGmxTracker to stake esGmx
  await sendTxn(esGmx.setHandler(stakedGmxTracker.address, true), "esGmx.setHandler(stakedGmxTracker)")
  // allow feeGmxTracker to stake bnGmx
  await sendTxn(bnGmx.setHandler(feeGmxTracker.address, true), "bnGmx.setHandler(feeGmxTracker")
  // allow rewardRouter to burn bnGmx
  await sendTxn(bnGmx.setMinter(rewardRouter.address, true), "bnGmx.setMinter(rewardRouter")

  // allow stakedGlpTracker to stake feeGlpTracker
  await sendTxn(feeGlpTracker.setHandler(stakedGlpTracker.address, true), "feeGlpTracker.setHandler(stakedGlpTracker)")
  // allow feeGlpTracker to stake glp
  await sendTxn(glp.setHandler(feeGlpTracker.address, true), "glp.setHandler(feeGlpTracker)")

  // allow rewardRouter to stake in feeGlpTracker
  await sendTxn(feeGlpTracker.setHandler(rewardRouter.address, true), "feeGlpTracker.setHandler(rewardRouter)")



  // allow rewardRouter to stake in stakedGlpTracker
  await sendTxn(stakedGlpTracker.setHandler(rewardRouter.address, true), "stakedGlpTracker.setHandler(rewardRouter)")

  await sendTxn(esGmx.setHandler(rewardRouter.address, true), "esGmx.setHandler(rewardRouter)")
  await sendTxn(esGmx.setHandler(stakedGmxDistributor.address, true), "esGmx.setHandler(stakedGmxDistributor)")

  await sendTxn(esGmx.setHandler(stakedGlpDistributor.address, true), "esGmx.setHandler(stakedGlpDistributor)")
  await sendTxn(esGmx.setHandler(stakedGlpTracker.address, true), "esGmx.setHandler(stakedGlpTracker)")
  await sendTxn(esGmx.setHandler(gmxVester.address, true), "esGmx.setHandler(gmxVester)")
  await sendTxn(esGmx.setHandler(glpVester.address, true), "esGmx.setHandler(glpVester)")

  await sendTxn(esGmx.setMinter(gmxVester.address, true), "esGmx.setMinter(gmxVester)")
  await sendTxn(esGmx.setMinter(glpVester.address, true), "esGmx.setMinter(glpVester)")

  await sendTxn(gmxVester.setHandler(rewardRouter.address, true), "gmxVester.setHandler(rewardRouter)")
  await sendTxn(glpVester.setHandler(rewardRouter.address, true), "glpVester.setHandler(rewardRouter)")

  await sendTxn(feeGmxTracker.setHandler(gmxVester.address, true), "feeGmxTracker.setHandler(gmxVester)")
  await sendTxn(stakedGlpTracker.setHandler(glpVester.address, true), "stakedGlpTracker.setHandler(glpVester)")

  // await sendTxn(esGmx.setMinter(wallet.address, true), "esGmx.setMinter(wallet)")

  // await sendTxn(esGmx.mint(stakedGmxDistributor.address, expandDecimals(50000 * 12, 18)), "esGmx.mint(stakedGmxDistributor") // ~50,000 GMX per month
  // await sendTxn(esGmx.mint(stakedGlpDistributor.address, expandDecimals(50000 * 12, 18)), "esGmx.mint(stakedGmxDistributor") // ~50,000 GMX per month

  // await sendTxn(stakedGmxDistributor.setTokensPerInterval("20667989410000000"), "stakedGmxDistributor.setTokensPerInterval") // 0.02066798941 esGmx per second
  // await sendTxn(stakedGlpDistributor.setTokensPerInterval("1157407407408"), "stakedGlpDistributor.setTokensPerInterval")

  // // mint bnGmx for distributor
  // await sendTxn(bnGmx.setMinter(wallet.address, true), "bnGmx.setMinter")
  // await sendTxn(bnGmx.mint(bonusGmxDistributor.address, expandDecimals(15 * 1000 * 1000, 18)), "bnGmx.mint(bonusGmxDistributor)")


  const glpRewardRouter = await deployContract("RewardRouterV2", [])
  const AddressZero = "0x0000000000000000000000000000000000000000"

  await sendTxn(glpRewardRouter.initialize(
    nativeToken.address,
    AddressZero,
    AddressZero,
    AddressZero,
    glp.address,
    AddressZero,
    AddressZero,
    AddressZero,
    feeGlpTracker.address,
    stakedGlpTracker.address,
    glpManager.address,
    AddressZero,
    AddressZero
  ), "glpRewardRouter.initialize")

  await sendTxn(feeGlpTracker.setHandler(glpRewardRouter.address, true), "feeGlpTracker.setHandler(rewardRouter)")
  await sendTxn(stakedGlpTracker.setHandler(glpRewardRouter.address, true), "stakedGlpTracker.setHandler(rewardRouter)")
  await sendTxn(glpManager.setHandler(glpRewardRouter.address, true), "glpManager.setHandler(rewardRouter)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

