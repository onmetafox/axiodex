const { parentPort } = require('worker_threads')

const gql = require("graphql-tag");
const { isEqual } = require('lodash');
const { PERIOD_TO_SECONDS, pricesClient, PUPPYNET } = require("../config");
const TtlCache = require("../utils/ttl-cache")

const ttlCache = new TtlCache(60, 1000)

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const LOAD_NEW_PRICES_LOOP_INTERVAL = IS_PRODUCTION ? 60000 : 5000
const LOAD_OLD_PRICES_LOOP_INTERVAL = IS_PRODUCTION ? 15000 : 5000

const cachedPrices = {
    [PUPPYNET]: {},
}
const candleByPriceId = {}

function priceToCandle(price) {
    return {
        t: price.timestamp,
        o: Number((price.open / 1e8).toFixed(8)),
        c: Number((price.close / 1e8).toFixed(8)),
        h: Number((price.high / 1e8).toFixed(8)),
        l: Number((price.low / 1e8).toFixed(8))
    }
}

function getPriceRange(prices, from, to, inbound = false) {
    const indexFrom = binSearchPrice(prices, from, inbound)
    const indexTo = binSearchPrice(prices, to, !inbound) + 1
    return prices.slice(indexFrom, indexTo)
}

function binSearchPrice(prices, timestamp, gt = true) {
    let left = 0
    let right = prices.length - 1
    let mid
    while (left + 1 < right) {
        mid = Math.floor((left + right) / 2)
        if (prices[mid].t < timestamp) {
            left = mid
        } else {
            right = mid
        }
    }
    const ret = gt ? right : left
    return ret
}

function getPricesLimit(limit, preferableChainId = ARBITRUM, symbol, period) {
    const prices = getPrices(preferableChainId, symbol, period)
    return prices.slice(Math.max(prices.length - limit, 0))
}

function getPricesFromTo(from, to, preferableChainId = ARBITRUM, symbol, period) {
    // const cacheKey = `${from}:${to}:${preferableChainId}:${symbol}:${period}`
    // const fromCache = ttlCache.get(cacheKey)
    // if (fromCache) {
    //     return fromCache
    // }
    const prices = getPriceRange(getPrices(preferableChainId, symbol, period), from, to)
    // ttlCache.set(cacheKey, prices)
    return prices
}

function getPrices(preferableChainId, symbol, period) {
    if (!cachedPrices[preferableChainId] || !cachedPrices[preferableChainId][symbol] || !cachedPrices[preferableChainId][symbol][period]) {
        return []
    }
    return cachedPrices[preferableChainId][symbol][period]
}

const CANDLE_PROPS = 'timestamp token period id open high low close'

const PRICE_START_TIMESTAMP = Math.floor(+new Date(2022, 0, 6) / 1000) // 6th of January 2022

function putPricesIntoCache(prices, chainId, append) {
    if (append === undefined) {
        throw new Error('Explicit append is required')
    }
    if (!prices || !chainId) {
        throw new Error('Invalid arguments')
    }

    let ret = true
    const groupByTokenAndPeriod = prices.reduce((acc, price) => {
        const token = price.token
        if (!acc[token]) {
            acc[token] = {}
        }
        if (!acc[token][price.period]) {
            acc[token][price.period] = []
        }
        if (price.timestamp < PRICE_START_TIMESTAMP) {
            ret = false
            return acc;
        }
        acc[token][price.period].push(price)
        return acc
    }, {})
    for (const token in groupByTokenAndPeriod) {
        for (let [period, pricesForTokenAndPeriod] of Object.entries(groupByTokenAndPeriod[token])) {
            if (pricesForTokenAndPeriod.length === 0) {
                continue
            }
            putPricesForTokenAndPeriodIntoCache(pricesForTokenAndPeriod, chainId, token, period, append)
        }
    }
    return ret
}

function putPricesForTokenAndPeriodIntoCache(prices, chainId, token, period, append) {
    cachedPrices[chainId][token] = cachedPrices[chainId][token] || {}
    cachedPrices[chainId][token][period] = cachedPrices[chainId][token][period] || []
    const candles = cachedPrices[chainId][token][period]
    if (append) {
        prices.reverse()
    }

    for (const price of prices) {
        const candle = priceToCandle(price)
        if (candleByPriceId[price.id]) {
            if (!isEqual(candleByPriceId[price.id], candle)) {
                candleByPriceId[price.id].c = candle.c
                candleByPriceId[price.id].h = candle.h
                candleByPriceId[price.id].l = candle.l
            }
        } else {
            if (append) {
                candles.push(candle)
            } else {
                candles.unshift(candle)
            }
            candleByPriceId[price.id] = candle
        }
    }
}

async function loadNewPrices(chainId, period) {
    if (!chainId) {
        throw new Error('requires chainId')
    }
    const getQuery = () => `{
        priceCandles(
            first: 100
            orderBy: timestamp
            orderDirection: desc
            where: { period: "${period}" }
        ) { ${CANDLE_PROPS} }
    }`

    try {
        const query = getQuery()
        const { data } = await pricesClient.query({ query: gql(query), fetchPolicy: 'no-cache' })
        const prices = data.priceCandles
        if (prices.length) {
            putPricesIntoCache(prices, chainId, true)
        }
    } catch (ex) {
        console.log(ex)
    }
    setTimeout(() => loadNewPrices(chainId, period), LOAD_NEW_PRICES_LOOP_INTERVAL)
}

async function loadOldPrices(chainId, period, before = Math.floor(Date.now() / 1000)) {
    if (!chainId) {
        throw new Error('requires chainId')
    }
    const getQueryPart = (before, skip) => `
        priceCandles(
            first: 1000
            skip: ${skip}
            orderBy: timestamp
            orderDirection: desc
            where: { timestamp_lte: ${before}, period: "${period}" }
        ) { ${CANDLE_PROPS} }
    `
    const getQuery = before => {
        if (period === "1d") {
            return `{
                p0: ${getQueryPart(before, 0)}
            }`
        }
        return `{
            p0: ${getQueryPart(before, 0)}
            p1: ${getQueryPart(before, 1000)}
            p2: ${getQueryPart(before, 2000)}
            p3: ${getQueryPart(before, 3000)}
            p4: ${getQueryPart(before, 4000)}
            p5: ${getQueryPart(before, 5000)}
        }`
    }

    const seenOldPrices = new Set()
    try {
        const query = getQuery(before)
        const { data } = await pricesClient.query({ query: gql(query), fetchPolicy: 'no-cache' })
        if (data && data.p0) {
            const prices = []
            for (let i = 0; i < 6; i++) {
                const part = data[`p${i}`]
                if (!part) {
                    break
                }
                for (const price of part) {
                    if (seenOldPrices.has(price.id)) {
                        continue
                    }
                    seenOldPrices.add(price.id)
                    prices.push(price)
                }
            }
            // console.log(prices[0])
            putPricesIntoCache(prices, chainId, false)
            before = prices[prices.length - 1].timestamp
        }
    } catch (ex) {
        console.log(ex)
    }
    setTimeout(() => loadOldPrices(chainId, period, before), LOAD_OLD_PRICES_LOOP_INTERVAL)
}

for (const period of Object.keys(PERIOD_TO_SECONDS)) {
    loadNewPrices(PUPPYNET, period)
    loadOldPrices(PUPPYNET, period)
}

parentPort.on('message', (msg) => {
    const port = msg.port
    if(msg.event==='get_candles_limit')
        port.postMessage({
            id: msg.id, event: 'candles', data: getPricesLimit(...msg.args)
        })
    else if(msg.event==='get_candles_range')
        port.postMessage({
            id: msg.id, event: 'candles', data: getPricesFromTo(...msg.args)
        })
    port.close()
})