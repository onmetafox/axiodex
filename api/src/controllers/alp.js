const router = require('express').Router()

const { ethers, BigNumber } = require("ethers")
const expandDecimals = require('../utils/expandDecimals');

const abiToken = require('../abi/Token.json')
const abiUniswapPaire = require('../abi/UniswapV2Pair.json')
const abiVault = require('../abi/Vault.json')
const abiAlpManager = require('../abi/AlpManager.json')
const abiReaderV2 = require('../abi/ReaderV2.json')

const contracts = require('../contracts.json')

const ALP_DECIMALS = 18
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

router.get('/', (req, res) => {
    const alpManagerContract = new ethers.Contract(contracts.AlpManager, abiAlpManager, provider);
    const readerContract = new ethers.Contract(contracts.Reader, abiReaderV2, provider)

    let aum = 0;
    let glpSupply = 0;
    let glpPrice = 0;
    let glpMarketCap = 0;
    alpManagerContract.getAums().then(data => {
        if(data && data.length > 0) {
            aum = data[0].add(data[1]).div(2)
        }
        readerContract.getTokenBalancesWithSupplies(ethers.constants.AddressZero, [contracts.AXN, contracts.ALP, contracts.USDG]).then(readerRes => {
            glpSupply = readerRes[3]
            glpPrice = aum && aum.gt(0) && glpSupply.gt(0) ? aum.mul(expandDecimals(1, ALP_DECIMALS)).div(glpSupply) : expandDecimals(1, ALP_DECIMALS)
            glpMarketCap = glpPrice.mul(glpSupply).div(expandDecimals(1, ALP_DECIMALS));

            res.json({"glpPrice":glpPrice, "glpMarketCap":glpMarketCap})
        }).catch(err => {
            console.error(err)
            res.json({"glpPrice":glpPrice, "glpMarketCap":glpMarketCap})
        })
    }).catch(err => {
        console.error(err)
        res.json({"glpPrice":glpPrice, "glpMarketCap":glpMarketCap})
    })

})
router.get('/total-supply', (req, res) => {
})

router.get('/total-staked', (req, res) => {
})

module.exports = router;