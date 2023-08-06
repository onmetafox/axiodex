const { contractAt, sendTxn } = require("../shared/helpers")

const wallet = { address: "0x5F799f365Fa8A2B60ac0429C48B153cA5a6f0Cf8" }
const timelock = { address: "0x59c46156ED614164eC66A3CFa5822797f533c902" }

async function printRewardTracker(rewardTracker, label) {
  console.log(label, "isHandler", await rewardTracker.isHandler(wallet.address))
  console.log(label, "gov", await rewardTracker.gov())
}

async function updateHandler(rewardTracker, label) {
  await sendTxn(rewardTracker.setHandler(wallet.address, false), `${label}, rewardTracker.setHandler`)
}

async function printToken(token, label) {
  console.log(label, "inPrivateTransferMode", await token.inPrivateTransferMode())
  console.log(label, "isHandler", await token.isHandler(wallet.address))
  console.log(label, "isMinter", await token.isMinter(wallet.address))
  console.log(label, "gov", await token.gov())
}

async function printUsdg(token, label) {
  console.log(label, "isVault", await token.vaults(wallet.address))
  console.log(label, "gov", await token.gov())
}

async function updateToken(token, label) {
  await sendTxn(token.setMinter(wallet.address, false), `${label}, token.setMinter`)
}

async function updateGov(contract, label) {
  await sendTxn(contract.setGov(timelock.address), `${label}.setGov`)
}

async function signalGov(prevGov, contract, nextGov, label) {
  await sendTxn(prevGov.signalSetGov(contract.address, nextGov.address), `${label}.signalSetGov`)
}

async function updateRewardTrackerGov(rewardTracker, label) {
  const distributorAddress = await rewardTracker.distributor()
  const distributor = await contractAt("RewardDistributor", distributorAddress)
  await sendTxn(rewardTracker.setGov(timelock.address), `${label}.setGov`)
  await sendTxn(distributor.setGov(timelock.address), `${label}.distributor.setGov`)
}

async function main() {
  const stakedGmxTracker = await contractAt("RewardTracker", "0x2bD10f8E93B3669b6d42E74eEedC65dd1B0a1342")
  const bonusGmxTracker = await contractAt("RewardTracker", "0x908C4D94D34924765f1eDc22A1DD098397c59dD4")
  const feeGmxTracker = await contractAt("RewardTracker", "0x4d268a7d4C16ceB5a606c173Bd974984343fea13")
  const stakedGlpTracker = await contractAt("RewardTracker", "0x9e295B5B976a184B14aD8cd72413aD846C299660")
  const feeGlpTracker = await contractAt("RewardTracker", "0xd2D1162512F927a7e282Ef43a362659E4F2a728F")

  await printRewardTracker(stakedGmxTracker, "stakedGmxTracker")
  await printRewardTracker(bonusGmxTracker, "bonusGmxTracker")
  await printRewardTracker(feeGmxTracker, "feeGmxTracker")
  await printRewardTracker(stakedGlpTracker, "stakedGlpTracker")
  await printRewardTracker(feeGlpTracker, "feeGlpTracker")

  const gmx = await contractAt("MintableBaseToken", "0x62edc0692BD897D2295872a9FFCac5425011c661")
  await printToken(gmx, "gmx")

  // await updateToken(gmx, "gmx")
  await updateGov(gmx, "gmx")

  await updateHandler(stakedGmxTracker, "stakedGmxTracker")
  await updateHandler(bonusGmxTracker, "bonusGmxTracker")
  await updateHandler(feeGmxTracker, "feeGmxTracker")
  await updateHandler(stakedGlpTracker, "stakedGlpTracker")
  await updateHandler(feeGlpTracker, "feeGlpTracker")

  const router = await contractAt("Router", "0x5F719c2F1095F7B9fc68a68e35B51194f4b6abe8")
  await updateGov(router, "router")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
