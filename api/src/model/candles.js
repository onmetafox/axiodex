const express = require('express')
const bodyParser = require('body-parser');
const { MessageChannel } = require("worker_threads")
const { VALID_PERIODS, BASENET, workers, PERIOD_TO_SECONDS } = require('../config');

const app = express()
app.use(bodyParser.json());

app.get('/:symbol', async (req, res) => {
	const period = req.query.period?.toLowerCase()

	if (!period || !VALID_PERIODS.has(period)) {
		res.end(`Invalid period. Valid periods are ${Array.from(VALID_PERIODS)}`)
		return
	}

	const validSymbols = new Set(['BTC', 'ETH', 'USDC'])
	const symbol = req.params.symbol
	if (!validSymbols.has(symbol)) {
		res.end(`Invalid symbol ${symbol}`)
		return
	}
	const preferableChainId = Number(req.query.preferableChainId)
	const validSources = new Set([BASENET])
	if (!validSources.has(preferableChainId)) {
		res.end(`Invalid preferableChainId ${preferableChainId}.`)
		return
	}

	let prices
	try {
		// prices = getPricesLimit(5000, preferableChainId, symbol, period)
		const worker = workers['candles']
		const subChannel = new MessageChannel()
		if(req.query.from) {
			worker.postMessage({
				event: 'get_candles_range',
				port: subChannel.port1,
				args: [Number(req.query.from), Number(req.query.from) + PERIOD_TO_SECONDS[period] * 3000, preferableChainId, symbol, period]
			}, [subChannel.port1])
		} else if(req.query.limit) {
			worker.postMessage({
				event: 'get_candles_limit',
				port: subChannel.port1,
				args: [Number(req.query.limit), preferableChainId, symbol, period]
			}, [subChannel.port1])
		} else {
			res.end()
			return
		}
		subChannel.port2.on('message', msg => {
			res.json({
				prices: msg.data,
				period,
				updatedAt: Math.floor(Date.now() / 1000)
			})
		})
	} catch (ex) {
		console.log(ex)
		res.end()
		return
	}

	// res.set('Cache-Control', 'max-age=60')	
})

module.exports = app