const { ethers, network } = require("hardhat")
const fs = require('fs')
const path = require('path')
const parse = require('csv-parse')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const readCsv = async (file) => {
  records = []
  const parser = fs
  .createReadStream(file)
  .pipe(parse({ columns: true, delimiter: ',' }))
  parser.on('error', function(err){
    console.error(err.message)
  })
  for await (const record of parser) {
    records.push(record)
  }
  return records
}

function getChainId(network) {
  return network.chain
}

async function getFrameSigner() {
  const [signer] = await ethers.getSigners()
  return signer
}

async function sendTxn(txnPromise, label) {
  const txn = await txnPromise
  console.info(`Sending ${label}...`)
  await txn.wait()
  console.info(`... Sent! ${txn.hash}`)
  await sleep(2000)
  return txn
}

async function callWithRetries(func, args, retriesCount = 3) {
  let i = 0
  while (true) {
    i++
    try {
      return await func(...args)
    } catch (ex) {
      if (i === retriesCount) {
        console.error("call failed %s times. throwing error", retriesCount)
        throw ex
      }
      console.error("call i=%s failed. retrying....", i)
      console.error(ex.message)
    }
  }
}

async function deployContract(contractName, args, label, options) {
  if (!options && typeof label === "object") {
    label = null
    options = label
  }

  const factory = await ethers.getContractFactory(contractName)
  const contract = await factory.deploy(...args)
  await contract.deployed()
  await updateABI(contractName)
  await verify(contract.address,[...args])
  console.log(contractName, contract.address)
  return contract
}

async function contractAt(contractName, contractAddress, provider) {
  return await ethers.getContractAt(contractName, contractAddress)
}

const updateABI = async (contractName)=>{
  // const abiDir = `${__dirname}/../abi`;
  // if (!fs.existsSync(abiDir)) {
  //     fs.mkdirSync(abiDir);
  // }
  // const Artifact = artifacts.readArtifactSync(contractName);
  // fs.writeFileSync(
  //     `${abiDir}/${contractName}.json`,
  //     JSON.stringify(Artifact.abi, null, 2)
  // )
}

const verify = async (contractAddress, args = [])=> {
  if(network=='localhost' || network=='hardhat') return
  try {
      await hre.run("verify:verify", {
          address: contractAddress,
          constructorArguments: args,
      });
  } catch(ex) {}
}

const tmpAddressesFilepath = path.join(__dirname, '..', '..', `.tmp-addresses-${process.env.HARDHAT_NETWORK}.json`)

function readTmpAddresses() {
  if (fs.existsSync(tmpAddressesFilepath)) {
    return JSON.parse(fs.readFileSync(tmpAddressesFilepath))
  }
  return {}
}

function writeTmpAddresses(json) {
  const tmpAddresses = Object.assign(readTmpAddresses(), json)
  fs.writeFileSync(tmpAddressesFilepath, JSON.stringify(tmpAddresses))
}

// batchLists is an array of lists
async function processBatch(batchLists, batchSize, handler) {
  let currentBatch = []
  const referenceList = batchLists[0]

  for (let i = 0; i < referenceList.length; i++) {
    const item = []

    for (let j = 0; j < batchLists.length; j++) {
      const list = batchLists[j]
      item.push(list[i])
    }

    currentBatch.push(item)

    if (currentBatch.length === batchSize) {
      console.log("handling currentBatch", i, currentBatch.length, referenceList.length)
      await handler(currentBatch)
      currentBatch = []
    }
  }

  if (currentBatch.length > 0) {
    console.log("handling final batch", currentBatch.length, referenceList.length)
    await handler(currentBatch)
  }
}

async function updateTokensPerInterval(distributor, tokensPerInterval, label) {
  const prevTokensPerInterval = await distributor.tokensPerInterval()
  if (prevTokensPerInterval.eq(0)) {
    // if the tokens per interval was zero, the distributor.lastDistributionTime may not have been updated for a while
    // so the lastDistributionTime should be manually updated here
    await sendTxn(distributor.updateLastDistributionTime({ gasLimit: 500000 }), `${label}.updateLastDistributionTime`)
  }
  await sendTxn(distributor.setTokensPerInterval(tokensPerInterval, { gasLimit: 500000 }), `${label}.setTokensPerInterval`)
}

module.exports = {
  readCsv,
  getFrameSigner,
  sendTxn,
  deployContract,
  contractAt,
  writeTmpAddresses,
  readTmpAddresses,
  callWithRetries,
  processBatch,
  updateTokensPerInterval
}
