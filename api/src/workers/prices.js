const { workerData } = require('worker_threads')
const { ethers } = require("ethers")
const multicall = require('ethereum-multicall')
const { default: gql } = require('graphql-tag')

const { parseUnits, formatUnits, parseEther } = ethers.utils

const abiPriceFeed = require("../abi/PriceFeed.json")
const abiFastPriceFeed = require("../abi/FastPriceFeed.json")
const { pricesClient } = require('../config')

const { contracts } = workerData
contracts.BONE = contracts.NATIVE_TOKEN

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL, Number(process.env.CHAIN))
const master = new ethers.Wallet(process.env.MASTER_SECRET, provider)
const keeper = new ethers.Wallet(ethers.utils.keccak256(Buffer.from('tail local keeper')), provider)
const Multicall = new multicall.Multicall({ ethersProvider: provider, multicallCustomContractAddress: contracts.Multicall3 })

const symbols = {
    'BONE': 1000000, 'BTC': 1000000, 'ETH': 1000000, 'SHIB': 1000000, 'USDC': 1000000
}
const status = {
    lastPrices: {}
}

const SecondaryPriceFeed = new ethers.Contract(contracts.SecondaryPriceFeed, abiFastPriceFeed, keeper)

const initialize = async () => {
    const requests = [{
        reference: `prices`,
        contractAddress: contracts.SecondaryPriceFeed,
        abi: abiFastPriceFeed,
        calls: Object.keys(symbols).map(symbol => {
            if(!contracts[symbol])
                return undefined
            return ({
                reference: symbol,
                methodName: 'prices',
                methodParameters: [contracts[symbol]]
            })
        }).filter(call => !!call)
    }]
    const { results: { prices } } = await Multicall.call(requests)
    prices.callsReturnContext.map(ctx => {
        if (ctx.success) {
            if (ctx.methodName == 'prices')
                status.lastPrices[ctx.reference] = Number(formatUnits(ctx.returnValues[0], 30)).toFixed(8)
        }
    })
}

initialize().then(() => {
    schedule()
})

const schedule = async () => {
    try {
        const balance = await provider.getBalance(keeper.address)
        if(balance.lt(parseEther('0.1'))) {
            await (await master.sendTransaction({
                to: keeper.address, value: parseEther('1')
            })).wait()
        }
        const gasFee = await provider.getFeeData()

        const query = gql(`{
            query {
                chainlinkPrices {
                    token
                    price
                }
            }
          }`);
        const {result, loading, errors} = await pricesClient.query({ query, fetchPolicy: 'no-cache' })
        if(errors) {
            console.error('schedule query error:', query, errors);
            return;
        }
        if(result.data && result.data.chainlinkPrices) {
            const updated = result.data.chainlinkPrices.reduce((prev, cur) => {
                const price = formatUnits(String(cur.price), 8)
                if(status.lastPrices[cur.token]==price)
                    return prev
                return {
                    ...prev,
                    [cur.token]: price
                }
            }, {})
            // console.log(result.data.chainlinkPrices, updated)
            status.lastPrices = { ...status.lastPrices, ...updated }
            const block = await provider.getBlock()            
            if(Object.keys(updated).length) {            
                try {
                    const addresses = Object.keys(updated).map(symbol => contracts[symbol])
                    const prices = Object.values(updated).map(price=>parseUnits(String(price), 30))
                    // const nonce = await provider.getTransactionCount(keeper.address)
                    await (await SecondaryPriceFeed.setPrices(addresses, prices, block.timestamp, { gasPrice: gasFee.maxFeePerGas })).wait()
                    console.log(addresses, updated)
                } catch(err) {
                    console.log(err)
                }
                for(const symbol in updated) {
                    if(contracts[`PriceFeed${symbol}`]) {
                        const PrimaryPriceFeed = new ethers.Contract(contracts[`PriceFeed${symbol}`], abiPriceFeed, keeper)
                        // const nonce = await provider.getTransactionCount(keeper.address)
                        await (await PrimaryPriceFeed.setLatestAnswer(parseUnits(updated[symbol], 8), { gasPrice: gasFee.maxFeePerGas })).wait()
                        console.log(symbol, updated[symbol])
                    }
                }
            }
        }
    } catch(ex) {
        console.log(ex)
    }
    setTimeout(schedule, 10000)
}
