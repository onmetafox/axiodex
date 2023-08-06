const express = require('express')
const bodyParser = require('body-parser')

const uiVersion = require("../config").UI_VERSION;

const app = express()
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json(uiVersion)
})

module.exports = app