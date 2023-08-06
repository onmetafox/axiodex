const express = require('express')
const bodyParser = require('body-parser')

const uiVersion = require("../config").UI_VERSION;

const app = express()
app.use(bodyParser.json());

app.get('/', (req, res) => {
	const orders = require("../controllers/orderData");

	const account = req.query.account;

	const data = orders.getOrderData(account);

	data.then(function(result) {
		res.json(result)
	})
})

module.exports = app