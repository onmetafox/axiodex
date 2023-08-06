const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json());

app.get('/', (req, res) => {
	try {
		const statsObject = {};

		const volumeState = require("../controllers/volumeState")
		const volumeData = volumeState.getVolumeState();

		volumeData.then(function(result) {
			const value = result[result.length - 1]?.cumulative;
			statsObject["totalVolume"] = value?.toString();
		})

		const houlyVolumeState = require("../controllers/hourlyVolume")
		const houlyVolumeData = houlyVolumeState.getHourlyVolume();

		houlyVolumeData.then(function(result) {
			const value = result[result.length - 1]?.cumulative;
			statsObject["volume24H"] = value?.toString();
		})

		const houlyFeeState = require("../controllers/hourlyFee")
		const houlyFeeData = houlyFeeState.getHourlyFee();

		houlyFeeData.then(function(result) {
			const value = result[result.length - 1]?.cumulative;
			statsObject["fee24H"] = value?.toString();
		})

		const userState = require("../controllers/userState")
		const userData = userState.getUserState();

		userData.then(function(result) {
			statsObject["totalUser"] = result[0]?.uniqueCountCumulative.toString();
		})

		const feeState = require("../controllers/feeState")
		const feeDate = feeState.getFeeState();

		feeDate.then(function(result) {
			const value = result[result.length - 1]?.cumulative;
			statsObject["totalFees"] = value?.toString();

			const tradeState = require("../controllers/tradeState")
			const tradeData = tradeState.getTradeState();
		
			tradeData.then(function(result) {
				if(result.data) {
					const openInterest = result.data[result.data.length - 1]?.openInterest
					const longOpenInterest = result.data[result.data.length - 1]?.longOpenInterest;
					const shortOpenInterest = result.data[result.data.length - 1]?.shortOpenInterest;
			
					statsObject["openInterest"] = openInterest.toString();
					statsObject["longOpenInterest"] = longOpenInterest.toString();
					statsObject["shortOpenInterest"] = shortOpenInterest.toString();
					
					const totalActivePosition = require("../config").TOTAL_ACTIVE_POSITION;

					statsObject["totalActivePositions"] = totalActivePosition;

					statsObject["status"] = 200;
			
					res.json(statsObject)
				} else {
					res.json({
						status: 400
					})
				}
			})
		})
	} catch(ex) {
		res.end()
	}
})

module.exports = app