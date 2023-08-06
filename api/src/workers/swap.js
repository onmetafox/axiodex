const { workerData } = require('worker_threads')
const { ethers } = require("ethers")
const multicall = require('ethereum-multicall')
const { default: gql } = require('graphql-tag')

const abiOrderBook = require("../abi/OrderBook.json")
const { ordersClient } = require('../config')
const { parseEther } = ethers.utils

const { contracts } = workerData

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL, Number(process.env.CHAIN))
const master = new ethers.Wallet(process.env.MASTER_SECRET, provider)
const executor = new ethers.Wallet(ethers.utils.keccak256(Buffer.from('tail swap executor')), provider)

const Multicall = new multicall.Multicall({ ethersProvider: provider, multicallCustomContractAddress: contracts.Multicall3 })

const OrderBook = new ethers.Contract(contracts.OrderBook, abiOrderBook, executor)

const schedule = async () => {
    try {
        const query = gql`
            query {
                orders(
                    where: { type: "swap", status: open }
                    orderBy: createdTimestamp
                    orderDirection: asc
                ) {
                    id
                    index
                    account
                    path
                    triggerRatio
                }
            }
        `
        const result = await ordersClient.query({ query })
        if(result.data) {
            const requests = [{
                reference: `validates`,
                contractAddress: OrderBook.address,
                abi: abiOrderBook,
                calls: result.data.orders.map(order => {
                    return ({
                        reference: order,
                        methodName: 'validateSwapOrderPriceWithTriggerAboveThreshold',
                        methodParameters: [
                            order.path,
                            order.triggerRatio,
                        ]
                    })
                })
            }]
            const { results: { validates } } = await Multicall.call(requests)
            const orders = validates ? validates.callsReturnContext.map(ctx => ctx.success && ctx.returnValues[0] ? ctx.reference : undefined).filter(v => v!==undefined) : []
            if(orders.length) {
                const balance = await provider.getBalance(executor.address)
                if(balance.lt(parseEther('0.1')))
                    await (await master.sendTransaction({
                        to: executor.address, value: parseEther('1')
                    })).wait()
                const gasFee = await provider.getFeeData()
                for(const order of orders) {
                    try {
                        console.log('executing swap order', order.id)
                        const nonce = await provider.getTransactionCount(executor.address)
                        await (await OrderBook.executeSwapOrder(order.account, order.index, executor.address, { gasPrice: gasFee.maxFeePerGas })).wait()
                        console.log('success!')
                    } catch(ex) {
                        console.log('failed!')
                    }
                }
                // const executions = [{
                //     reference: `availables`,
                //     contractAddress: OrderBook.address,
                //     abi: abiOrderBook,
                //     calls: orders.map(order => {
                //         return ({
                //             reference: order.account,
                //             methodName: 'executeSwapOrder',
                //             methodParameters: [
                //                 order.account,
                //                 order.index,
                //                 executor.address
                //             ]
                //         })
                //     })
                // }]
                // console.log('executing swap orders...', orders)
                // const { results: { availables } } = await Multicall.call(executions)
                // const success = availables.callsReturnContext.map(ctx => ctx.success ? ctx.reference : undefined).filter(v => v!==undefined)
                // if(success.length) {
                //     console.log(success)
                // } else {
                //     console.log('failed!')
                // }
            }
        }
    } catch(ex) {
        console.log(ex)
    }
    setTimeout(schedule, 10000)
}

schedule()