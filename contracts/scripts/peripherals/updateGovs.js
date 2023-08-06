const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

// TODO: update GlpManager addresses
async function getArbValues() {
  const contracts = [
    "0x489ee077994B6658eAfA855C308275EAd8097C4A", // Vault
    "0x199070DDfd1CFb69173aa2F7e20906F26B363004", // GmxVester
    "0xA75287d2f8b217273E7FCD7E86eF07D33972042E", // GlpVester
    "0x321F653eED006AD1C29D174e17d96351BDe22649", // GlpManager
    "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258", // GLP
    "0xf42Ae1D54fd613C9bb14810b0588FaAa09a426cA", // ES_GMX
    "0x35247165119B69A40edD5304969560D0ef486921", // BN_GMX
    "0x45096e7aA921f27590f8F19e457794EB09678141", // USDG
  ]

  const trackers = [
    "0x908C4D94D34924765f1eDc22A1DD098397c59dD4", // StakedGmxTracker
    "0x4d268a7d4C16ceB5a606c173Bd974984343fea13", // BonusGmxTracker
    "0xd2D1162512F927a7e282Ef43a362659E4F2a728F", // FeeGmxTracker
    "0x1aDDD80E6039594eE970E5872D247bf0414C8903", // StakedGlpTracker
    "0x4e971a87900b931fF39d1Aad67697F49835400b6", // FeeGlpTracker
    "0xaA940C0417715bbDA7FE3EAd5b09671E37745735", // ShortsTracker
  ]

  const nextTimelock = { address: "0x09fEc993Be76230296Ce8C3B8EDafd32B6240126" }

  return { contracts, trackers, nextTimelock }
}

async function getAvaxValues() {
  const contracts = [
    "0x9ab2De34A33fB459b538c43f251eB825645e8595", // Vault
    "0x472361d3cA5F49c8E633FB50385BfaD1e018b445", // GmxVester
    "0x62331A7Bd1dfB3A7642B7db50B5509E57CA3154A", // GlpVester
    "0xe1ae4d4b06A5Fe1fc288f6B4CD72f9F8323B107F", // GlpManager
    "0x01234181085565ed162a948b6a5e88758CD7c7b8", // GLP
    "0xFf1489227BbAAC61a9209A08929E4c2a526DdD17", // ES_GMX
    "0x8087a341D32D445d9aC8aCc9c14F5781E04A26d2", // BN_GMX
    "0xc0253c3cC6aa5Ab407b5795a04c28fB063273894", // USDG
  ]

  const trackers = [
    "0x2bD10f8E93B3669b6d42E74eEedC65dd1B0a1342", // StakedGmxTracker
    "0x908C4D94D34924765f1eDc22A1DD098397c59dD4", // BonusGmxTracker
    "0x4d268a7d4C16ceB5a606c173Bd974984343fea13", // FeeGmxTracker
    "0x9e295B5B976a184B14aD8cd72413aD846C299660", // StakedGlpTracker
    "0xd2D1162512F927a7e282Ef43a362659E4F2a728F", // FeeGlpTracker
    "0xaA940C0417715bbDA7FE3EAd5b09671E37745735", // ShortsTracker
  ]

  const nextTimelock = { address: "0xb10817448e630177a6a2ECc10E4e9977dBcE67E5" }

  return { contracts, trackers, nextTimelock }
}

async function getGoerliValues() {
  const contracts = [
    "0x05438563b4Ff6Bab18C00D689c7e5447A4e1C2B1", // Vault
    "0x95435D6d22cCE61A79852BB81f356A967C2F45d4", // GmxVester
    "0x5C54dB44B6B6D3dC8838183Bec8875DeB80076cC", // GlpVester
    "0x83e3DA08A2867FD366e34b39C3b232C9c5740508", // GlpManager
    "0x89cf028cE9f8FF383cddA5D780a967e32A8c62Fe", // GLP
    "0x777f681C5581F250e57471487F77FBA9727217f6", // ES_GMX
    "0xCbF5550a55C937C4DB2fCcD3fcE7C111BD609e4e", // BN_GMX
    "0x15730E131ce1C23800CEA12ADB3BDD20b2C32320", // USDG
  ]

  const trackers = [
    "0x84562a6FAC4F892b3c4b533eE048a1d5563c1F33", // StakedGmxTracker
    "0x093baE2A23Ce958571Ac31DB5Ae37000baF6063f", // BonusGmxTracker
    "0x9f528097eFa1CFdEb5EfC3229a2Ee1BA8Dd97A8b", // FeeGmxTracker
    "0x968830E9C55e27fccbbE0688353A4c8F04F471c7", // StakedGlpTracker
    "0xc9DC3ee97Cb93b7680f44Ca3b57A68dC46C20B5E", // FeeGlpTracker
    "0xaA940C0417715bbDA7FE3EAd5b09671E37745735", // ShortsTracker
  ]

  const nextTimelock = { address: "0x2c79620F6f6eBff251A62eBE3eFfc1C9b7C2209d" }

  return { contracts, trackers, nextTimelock }
}

async function getFantomValues() {
  const contracts = [
    "0x05438563b4Ff6Bab18C00D689c7e5447A4e1C2B1", // Vault
    "0x95435D6d22cCE61A79852BB81f356A967C2F45d4", // GmxVester
    "0x5C54dB44B6B6D3dC8838183Bec8875DeB80076cC", // GlpVester
    "0x83e3DA08A2867FD366e34b39C3b232C9c5740508", // GlpManager
    "0x89cf028cE9f8FF383cddA5D780a967e32A8c62Fe", // GLP
    "0x777f681C5581F250e57471487F77FBA9727217f6", // ES_GMX
    "0xCbF5550a55C937C4DB2fCcD3fcE7C111BD609e4e", // BN_GMX
    "0x15730E131ce1C23800CEA12ADB3BDD20b2C32320", // USDG
  ]

  const trackers = [
    "0x84562a6FAC4F892b3c4b533eE048a1d5563c1F33", // StakedGmxTracker
    "0x093baE2A23Ce958571Ac31DB5Ae37000baF6063f", // BonusGmxTracker
    "0x9f528097eFa1CFdEb5EfC3229a2Ee1BA8Dd97A8b", // FeeGmxTracker
    "0x968830E9C55e27fccbbE0688353A4c8F04F471c7", // StakedGlpTracker
    "0xc9DC3ee97Cb93b7680f44Ca3b57A68dC46C20B5E", // FeeGlpTracker
    "0xaA940C0417715bbDA7FE3EAd5b09671E37745735", // ShortsTracker
  ]

  const nextTimelock = { address: "0x2c79620F6f6eBff251A62eBE3eFfc1C9b7C2209d" }

  return { contracts, trackers, nextTimelock }
}

async function getValues() {
  const contracts = [
    "0xAC87f5Bf7892FFF31E10762fb0cE1dCB69e5ac91", // Vault
    "0x4f158606884Ba5676F10e3BAC636279Da675De49", // GmxVester
    "0x8730B8bCd563d5a77e431C71a74688a4cB924618", // GlpVester
    "0x481B3279FD402d845A1b00864B163BFc46eE2e36", // GlpManager
    "0xfAfC34e8B774c50F23D5b8531086acBD1a0516E2", // GLP
    "0xFE82c06249e7a350277826F3E1d528C7Bc166E2a", // ES_GMX
    "0x9459Df0F9Be75F17059d711D6E7B930330390d4e", // BN_GMX
    "0x02fc856c698b8CBeaaf8BCab3B211BFCd7E65abb", // USDG
  ]

  const trackers = [
    "0xfB46b38772a78FE5145a4C17123e2C832E95838E", // StakedGmxTracker
    "0x3943Edb70bb2240617645389e89b8d2eD081896A", // BonusGmxTracker
    "0x6f6123a03dB0800F4c670348FEd5013152a80b83", // FeeGmxTracker
    "0x92C4A1F6F7C51be71Fa44e8889DE8d11c7358298", // StakedGlpTracker
    "0xfE48d8667F2F009bce1509d45fe3Bd7443931e46", // FeeGlpTracker
    "0xaA940C0417715bbDA7FE3EAd5b09671E37745735", // ShortsTracker
  ]

  const nextTimelock = { address: "0x2c79620F6f6eBff251A62eBE3eFfc1C9b7C2209d" }

  return { contracts, trackers, nextTimelock }
}

async function setGov(target, nextTimelock, signer) {
    const prevTimelock = await contractAt("Timelock", await target.gov(), signer)
    if (prevTimelock.address.toLowerCase() === nextTimelock.address.toLowerCase()) {
      console.info("gov already set to nextTimelock, skipping", target.address)
      return
    }
    // await sendTxn(prevTimelock.signalSetGov(target.address, nextTimelock.address), `signalSetGov: ${target.address}, ${nextTimelock.address}`)
    // await sendTxn(prevTimelock.setGov(target.address, nextTimelock.address), `setGov: ${target.address}, ${nextTimelock.address}`)
    await sendTxn(target.setGov(nextTimelock.address), `setGov: ${target.address}, ${nextTimelock.address}`)
}

async function main() {
  const signer = await getFrameSigner()

  const { contracts, trackers, nextTimelock } = await getValues()

  for (let i = 0; i < contracts.length; i++) {
    const target = await contractAt("contracts/access/Governable.sol:Governable", contracts[i])
    await setGov(target, nextTimelock)
  }

  for (let i = 0; i < trackers.length; i++) {
    const rewardTracker = await contractAt("RewardTracker", trackers[i])
    const distributor = await contractAt("RewardDistributor", await rewardTracker.distributor())

    await setGov(rewardTracker, nextTimelock)
    await setGov(distributor, nextTimelock)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
