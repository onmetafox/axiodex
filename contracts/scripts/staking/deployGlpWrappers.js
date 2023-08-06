const { getFrameSigner, deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getArbValues() {
  const glp = { address: "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258" }
  const glpManager = { address: "0x321F653eED006AD1C29D174e17d96351BDe22649" }
  const stakedGlpTracker = await contractAt("RewardTracker", "0x1aDDD80E6039594eE970E5872D247bf0414C8903")
  const feeGlpTracker = await contractAt("RewardTracker", "0x4e971a87900b931fF39d1Aad67697F49835400b6")

  return { glp, glpManager, stakedGlpTracker, feeGlpTracker }
}

async function getAvaxValues() {
  const glp = { address: "0x01234181085565ed162a948b6a5e88758CD7c7b8" }
  const glpManager = { address: "0xe1ae4d4b06A5Fe1fc288f6B4CD72f9F8323B107F" }
  const stakedGlpTracker = await contractAt("RewardTracker", "0x9e295B5B976a184B14aD8cd72413aD846C299660")
  const feeGlpTracker = await contractAt("RewardTracker", "0xd2D1162512F927a7e282Ef43a362659E4F2a728F")

  return { glp, glpManager, stakedGlpTracker, feeGlpTracker }
}

async function getGoerliValues() {
  const glp = { address: "0x1173857Eb1d9bDc1a2040bDB3F6a86688A3d1bB8" }
  const glpManager = { address: "0xD26314C936eC68311169d8B71aD9032496d8Ea96" }
  const stakedGlpTracker = await contractAt("RewardTracker", "0xD5Da733CBd9f24fCFbF584D606e5fca553cd657f")
  const feeGlpTracker = await contractAt("RewardTracker", "0x1418Dd5822D5b0d0f4cEF19015c86f8D7170FE33")

  return { glp, glpManager, stakedGlpTracker, feeGlpTracker }
}

async function getFantomValues() {
  const glp = { address: "0xcd65Ac83b9A518537aD286BEB5df5477ce17B0BF" }
  const glpManager = { address: "0x1e3F35825d6481B26D3727D96731FB8c5252B7e2" }
  const stakedGlpTracker = await contractAt("RewardTracker", "0x654F4CF82d3a0B878240262276aFB8eB99cAe216")
  const feeGlpTracker = await contractAt("RewardTracker", "0x06158CB4Dce4eA438fee783B4f0b123bB03d639C")

  return { glp, glpManager, stakedGlpTracker, feeGlpTracker }
}

async function getValues() {
  const glp = { address: "0xfAfC34e8B774c50F23D5b8531086acBD1a0516E2" }
  const glpManager = { address: "0x481B3279FD402d845A1b00864B163BFc46eE2e36" }
  const stakedGlpTracker = await contractAt("RewardTracker", "0x92C4A1F6F7C51be71Fa44e8889DE8d11c7358298")
  const feeGlpTracker = await contractAt("RewardTracker", "0xfE48d8667F2F009bce1509d45fe3Bd7443931e46")

  return { glp, glpManager, stakedGlpTracker, feeGlpTracker }
}

async function main() {
  const signer = await getFrameSigner()
  const { glp, glpManager, stakedGlpTracker, feeGlpTracker } = await getValues()

  const stakedGlp = await deployContract("StakedGlp", [
    glp.address,
    glpManager.address,
    stakedGlpTracker.address,
    feeGlpTracker.address
  ])

  await sendTxn(feeGlpTracker.setHandler(stakedGlp.address, true), `feeGlpTracker.setHandler`)
  await sendTxn(stakedGlpTracker.setHandler(stakedGlp.address, true), `feeGlpTracker.setHandler`)

  await deployContract("GlpBalance", [glpManager.address, stakedGlpTracker.address])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
