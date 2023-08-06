const { workerData } = require('worker_threads')
const { ethers } = require("ethers")
const { parseEther } = ethers.utils

const abiPositionRouter = require("../abi/PositionRouter.json")

const { contracts } = workerData
// const contracts = require("../contracts.json")
contracts.BONE = contracts.NATIVE_TOKEN
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL, Number(process.env.CHAIN))
const master = new ethers.Wallet(process.env.MASTER_SECRET, provider)
const keeper = new ethers.Wallet(ethers.utils.keccak256(Buffer.from('position keeper')), provider)

const PositionRouter = new ethers.Contract(contracts.PositionRouter, abiPositionRouter, keeper)

const schedule = async () => {
    try {
        const balance = await provider.getBalance(keeper.address)
        if(balance.lt(parseEther('0.1'))) {
            await (await master.sendTransaction({
                to: keeper.address, value: parseEther('1')
            })).wait()
        }
        const gasFee = await provider.getFeeData()

        const queryLength = await PositionRouter.getRequestQueueLengths()
        if(queryLength[1] > queryLength[0]) {
            console.log('Increase', queryLength[0], queryLength[1])
            await (await PositionRouter.executeIncreasePositions(queryLength[0] + queryLength[1], keeper.address, { gasPrice: gasFee.maxFeePerGas })).wait()
        }
        if(queryLength[3] > queryLength[2]) {
            console.log('Decrease', queryLength[2], queryLength[3])
            await (await PositionRouter.executeDecreasePositions(queryLength[2] + queryLength[3], keeper.address, { gasPrice: gasFee.maxFeePerGas })).wait()
        }
    } catch(ex) {
        console.log(ex)
    }
    setTimeout(schedule, 100)
}
schedule()

