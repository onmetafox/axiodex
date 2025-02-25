const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

const { AddressZero } = ethers.constants

async function runForArbitrum() {
  const admin = "0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b"
  const rewardManager = { address: AddressZero }
  const buffer = 24 * 60 * 60
  const longBuffer = 7 * 24 * 60 * 60
  const tokenManager = { address: "0xddDc546e07f1374A07b270b7d863371e575EA96A" }
  const mintReceiver = { address: AddressZero }
  const maxTokenSupply = expandDecimals("13250000", 18)

  const timelock = await deployContract("GmxTimelock", [
    admin,
    buffer,
    longBuffer,
    rewardManager.address,
    tokenManager.address,
    mintReceiver.address,
    maxTokenSupply
  ], "GmxTimelock", { gasLimit: 100000000 })
}

async function runForAvax() {
  const admin = "0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b"
  const rewardManager = { address: ethers.constants.AddressZero }
  const buffer = 24 * 60 * 60
  const longBuffer = 7 * 24 * 60 * 60
  const tokenManager = { address: "0x8b25Ba1cAEAFaB8e9926fabCfB6123782e3B4BC2" }
  const mintReceiver = { address: AddressZero }
  const maxTokenSupply = expandDecimals("13250000", 18)

  const timelock = await deployContract("GmxTimelock", [
    admin,
    buffer,
    longBuffer,
    rewardManager.address,
    tokenManager.address,
    mintReceiver.address,
    maxTokenSupply
  ])
}

async function runForGoerli() {
  const wallet = await getFrameSigner()
  const admin = wallet.address
  const rewardManager = { address: ethers.constants.AddressZero }
  const buffer = 24 * 60 * 60
  const longBuffer = 7 * 24 * 60 * 60
  const tokenManager = { address: "0x2Dd4eCB4b1444dA218243D6Ba7F028A8470e4525" }
  const mintReceiver = { address: AddressZero }
  const maxTokenSupply = expandDecimals("13250000", 18)

  const timelock = await deployContract("GmxTimelock", [
    admin,
    buffer,
    longBuffer,
    rewardManager.address,
    tokenManager.address,
    mintReceiver.address,
    maxTokenSupply
  ])
}

async function runForFantom() {
  const wallet = await getFrameSigner()
  const admin = wallet.address
  const rewardManager = { address: ethers.constants.AddressZero }
  const buffer = 24 * 60 * 60
  const longBuffer = 7 * 24 * 60 * 60
  const tokenManager = { address: "0xb9759E77E3BB19098feb2feC0dCB492a76A9b562" }
  const mintReceiver = { address: AddressZero }
  const maxTokenSupply = expandDecimals("13250000", 18)

  const timelock = await deployContract("GmxTimelock", [
    admin,
    buffer,
    longBuffer,
    rewardManager.address,
    tokenManager.address,
    mintReceiver.address,
    maxTokenSupply
  ])
}

async function main() {
  const wallet = await getFrameSigner()
  const admin = wallet.address
  const rewardManager = { address: ethers.constants.AddressZero }
  const buffer = 24 * 60 * 60
  const longBuffer = 7 * 24 * 60 * 60
  const tokenManager = { address: "0x89a0BA7D5703c98B79445774d34148F5e2B415F5" }
  const mintReceiver = { address: AddressZero }
  const maxTokenSupply = expandDecimals("13250000", 18)

  const timelock = await deployContract("GmxTimelock", [
    admin,
    buffer,
    longBuffer,
    rewardManager.address,
    tokenManager.address,
    mintReceiver.address,
    maxTokenSupply
  ])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
