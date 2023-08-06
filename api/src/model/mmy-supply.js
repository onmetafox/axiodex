const express = require('express')
const bodyParser = require('body-parser')

// const Web3 = require('web3')
const { ethers } = require("ethers")
const abiToken = require('../abi/Token.json')
const contracts = require('../contracts.json')

const provider = new ethers.providers.JsonRpcProvider('https://puppynet.shibrpc.com', 719)

const app = express()
app.use(bodyParser.json());

app.get('/', (req, res) => {
    const contract = new ethers.Contract(contracts.GMX, abiToken, provider)
    contract.totalSupply().then(result => {
        res.json(result)
    })
})

module.exports = app