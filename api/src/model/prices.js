const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json());

app.get('/', (req, res) => {
	const prices = require("../controllers/prices")
	const pricesData = prices.getPrices();

	pricesData.then(function (result) {
		res.json(result)
	})
})

module.exports = app