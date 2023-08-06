const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json());

app.get('/', (req, res) => {
	const trades = require("../controllers/tradeData");

	const account = req.query.address;
	const after = req.query.after;

	const data = trades.getTradeData(account, after);

	data.then(function(result) {
		res.json(result)
	})
})

module.exports = app