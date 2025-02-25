const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const usdg = await contractAt("USDG", "0x15730E131ce1C23800CEA12ADB3BDD20b2C32320")
  const wbnb = await contractAt("WETH", "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889")
  const xgmt = await contractAt("YieldToken", "0x0A9EC17e58627F82d9ebE2cB0Ca5BA4840c04556")

  const gmtUsdgPair = { address: "0xa41e57459f09a126F358E118b693789d088eA8A0" }
  const gmtUsdgFarm = await deployContract("YieldFarm", ["GMT-USDG Farm", "GMT-USDG:FARM", gmtUsdgPair.address], "gmtUsdgFarm")

  const xgmtUsdgPair = { address: "0x0b622208fc0691C2486A3AE6B7C875b4A174b317" }
  const xgmtUsdgFarm = await deployContract("YieldFarm", ["xGMT-USDG Farm", "xGMT-USDG:FARM", xgmtUsdgPair.address], "xgmtUsdgFarm")

  const usdgYieldTracker = await deployContract("YieldTracker", [usdg.address], "usdgYieldTracker")
  const usdgRewardDistributor = await deployContract("TimeDistributor", [], "usdgRewardDistributor")

  await sendTxn(usdg.setYieldTrackers([usdgYieldTracker.address]), "usdg.setYieldTrackers")
  await sendTxn(usdgYieldTracker.setDistributor(usdgRewardDistributor.address), "usdgYieldTracker.setDistributor")
  await sendTxn(usdgRewardDistributor.setDistribution([usdgYieldTracker.address], ["0"], [wbnb.address]), "usdgRewardDistributor.setDistribution")

  const xgmtYieldTracker = await deployContract("YieldTracker", [xgmt.address], "xgmtYieldTracker")
  const xgmtRewardDistributor = await deployContract("TimeDistributor", [], "xgmtRewardDistributor")

  await sendTxn(xgmt.setYieldTrackers([xgmtYieldTracker.address]), "xgmt.setYieldTrackers")
  await sendTxn(xgmtYieldTracker.setDistributor(xgmtRewardDistributor.address), "xgmtYieldTracker.setDistributor")
  await sendTxn(xgmtRewardDistributor.setDistribution([xgmtYieldTracker.address], ["0"], [wbnb.address]), "xgmtRewardDistributor.setDistribution")

  const gmtUsdgFarmYieldTrackerXgmt = await deployContract("YieldTracker", [gmtUsdgFarm.address], "gmtUsdgFarmYieldTrackerXgmt")
  const gmtUsdgFarmDistributorXgmt = await deployContract("TimeDistributor", [], "gmtUsdgFarmDistributorXgmt")

  await sendTxn(gmtUsdgFarmYieldTrackerXgmt.setDistributor(gmtUsdgFarmDistributorXgmt.address), "gmtUsdgFarmYieldTrackerXgmt.setDistributor")
  await sendTxn(gmtUsdgFarmDistributorXgmt.setDistribution([gmtUsdgFarmYieldTrackerXgmt.address], ["0"], [xgmt.address]), "gmtUsdgFarmDistributorXgmt.setDistribution")

  const gmtUsdgFarmYieldTrackerWbnb = await deployContract("YieldTracker", [gmtUsdgFarm.address], "gmtUsdgFarmYieldTrackerWbnb")
  const gmtUsdgFarmDistributorWbnb = await deployContract("TimeDistributor", [], "gmtUsdgFarmDistributorWbnb")

  await sendTxn(gmtUsdgFarmYieldTrackerWbnb.setDistributor(gmtUsdgFarmDistributorWbnb.address), "gmtUsdgFarmYieldTrackerWbnb.setDistributor")
  await sendTxn(gmtUsdgFarmDistributorWbnb.setDistribution([gmtUsdgFarmYieldTrackerWbnb.address], ["0"], [wbnb.address]), "gmtUsdgFarmDistributorWbnb.setDistribution")

  await sendTxn(gmtUsdgFarm.setYieldTrackers([gmtUsdgFarmYieldTrackerXgmt.address, gmtUsdgFarmYieldTrackerWbnb.address]), "gmtUsdgFarm.setYieldTrackers")

  const xgmtUsdgFarmYieldTrackerXgmt = await deployContract("YieldTracker", [xgmtUsdgFarm.address], "xgmtUsdgFarmYieldTrackerXgmt")
  const xgmtUsdgFarmDistributorXgmt = await deployContract("TimeDistributor", [], "xgmtUsdgFarmDistributorXgmt")

  await sendTxn(xgmtUsdgFarmYieldTrackerXgmt.setDistributor(xgmtUsdgFarmDistributorXgmt.address), "xgmtUsdgFarmYieldTrackerXgmt.setDistributor")
  await sendTxn(xgmtUsdgFarmDistributorXgmt.setDistribution([xgmtUsdgFarmYieldTrackerXgmt.address], ["0"], [xgmt.address]), "xgmtUsdgFarmDistributorXgmt.setDistribution")

  const xgmtUsdgFarmYieldTrackerWbnb = await deployContract("YieldTracker", [xgmtUsdgFarm.address], "xgmtUsdgFarmYieldTrackerWbnb")
  const xgmtUsdgFarmDistributorWbnb = await deployContract("TimeDistributor", [], "xgmtUsdgFarmDistributorWbnb")

  await sendTxn(xgmtUsdgFarmYieldTrackerWbnb.setDistributor(xgmtUsdgFarmDistributorWbnb.address), "xgmtUsdgFarmYieldTrackerWbnb.setDistributor")
  await sendTxn(xgmtUsdgFarmDistributorWbnb.setDistribution([xgmtUsdgFarmYieldTrackerWbnb.address], ["0"], [wbnb.address]), "gmtUsdgFarmDistributorWbnb.setDistribution")

  await sendTxn(xgmtUsdgFarm.setYieldTrackers([xgmtUsdgFarmYieldTrackerXgmt.address, xgmtUsdgFarmYieldTrackerWbnb.address]), "xgmtUsdgFarm.setYieldTrackers")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
