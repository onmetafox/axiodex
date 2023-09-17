const { workerData } = require('worker_threads')
const { ethers } = require("ethers")
const multicall = require('ethereum-multicall')
const { default: gql } = require('graphql-tag')

const abiOrderBook = require("../abi/OrderBook.json")
const { ordersClient } = require('../config')

const { contracts } = workerData

// contracts.OrderBook = "0x4296e307f108B2f583FF2F7B7270ee7831574Ae5"

// const abi = new ethers.utils.AbiCoder()
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL | '', process.env.CHAIN)
// const provider = new ethers.providers.JsonRpcProvider('https://avalanche-c-chain.publicnode.com', 43114)
const keeper = new ethers.Wallet('008e099f4163810b4567186c0d8dd847eb75f01a1c527edcf684ebf019986a81', provider)
// const Multicall = new multicall.Multicall({ ethersProvider: provider, multicallCustomContractAddress: contracts.Multicall3 })
const Multicall = new multicall.Multicall({ ethersProvider: provider, tryAggregate: true })

const OrderBook = new ethers.Contract(contracts.OrderBook, abiOrderBook, keeper)

const schedule = async () => {
    try {
        const query = gql`
            query {
                orders(
                    where: { type: "increase", status: open }
                    orderBy: createdTimestamp
                    orderDirection: asc
                ) {
                    id
                    index
                    account
                    triggerAboveThreshold
                    triggerPrice
                    indexToken
                    isLong
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
                        methodName: 'validatePositionOrderPrice',
                        methodParameters: [
                            order.triggerAboveThreshold,
                            order.triggerPrice,
                            order.indexToken,
                            order.isLong,
                            true
                        ]
                    })
                })
            }]
            const { results: { validates } } = await Multicall.call(requests)
            const orders = validates.callsReturnContext.map(ctx => ctx.success && ctx.returnValues[0] ? ctx.reference : undefined).filter(v => v!==undefined)
            if(orders.length) {
                const executions = [{
                    reference: `executions`,
                    contractAddress: OrderBook.address,
                    abi: abiOrderBook,
                    calls: orders.map(order => {
                        return ({
                            reference: order.account,
                            methodName: 'executeIncreaseOrder',
                            methodParameters: [
                                order.account,
                                order.index,
                                keeper.address
                            ]
                        })
                    })
                }]
                console.log('executing increase orders...', orders.length)
                const { results: { availables } } = await Multicall.call(executions)
                const success = availables.callsReturnContext.map(ctx => ctx.success ? ctx.reference : undefined).filter(v => v!==undefined)
                if(success.length) {
                    console.log(success)
                } else {
                    console.log('failed!')
                }
            }
        }
    } catch(ex) {
        console.log(ex)
    }
    setTimeout(schedule, 10000)
}

schedule()