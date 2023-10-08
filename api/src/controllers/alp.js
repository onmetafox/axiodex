const router = require('express').Router()

const { ethers, BigNumber } = require("ethers")
const expandDecimals = require('../utils/expandDecimals');

const abiToken = require('../abi/Token.json')
const abiUniswapPaire = require('../abi/UniswapV2Pair.json')
const abiVault = require('../abi/Vault.json')
const abiAlpManager = require('../abi/AlpManager.json')
const abiReaderV2 = require('../abi/ReaderV2.json')

const contracts = require('../contracts.json');
const formatAmount = require('../utils/formatAmount');

const ALP_DECIMALS = 18
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

router.get('/', (req, res) => {
    const alpManagerContract = new ethers.Contract(contracts.AlpManager, abiAlpManager, provider);
    const readerContract = new ethers.Contract(contracts.Reader, abiReaderV2, provider)

    let aum = 0;
    let alpSupply = 0;
    let alpPrice = 0;
    let alpMarketCap = 0;
    alpManagerContract.getAums().then(data => {
        if(data && data.length > 0) {
            aum = data[0].add(data[1]).div(2)
        }
        readerContract.getTokenBalancesWithSupplies(ethers.constants.AddressZero, [contracts.AXN, contracts.ALP, contracts.USDG]).then(readerRes => {
            alpSupply = readerRes[3]
            alpPrice = aum && aum.gt(0) && alpSupply.gt(0) ? aum.mul(expandDecimals(1, ALP_DECIMALS)).div(alpSupply) : expandDecimals(1, 30)
            alpMarketCap = alpPrice.mul(alpSupply).div(expandDecimals(1, ALP_DECIMALS));

            res.json({"price":formatAmount(alpPrice, 30, 2, true), "totalSupply":formatAmount(alpSupply, 18, 0, true), "totalStaked":formatAmount(alpMarketCap, 30, 2, true), "marketCap":formatAmount(alpMarketCap, 30, 2, true)})
        }).catch(err => {
            console.error(err)
            res.json({"price":formatAmount(alpPrice, 30, 2, true), "totalSupply":formatAmount(alpSupply, 18, 0, true), "totalStaked":formatAmount(alpMarketCap, 30, 2, true), "marketCap":formatAmount(alpMarketCap, 30, 2, true)})
        })
    }).catch(err => {
        console.error(err)
        res.json({"price":formatAmount(alpPrice, 30, 2, true), "totalSupply":formatAmount(alpSupply, 18, 0, true), "totalStaked":formatAmount(alpMarketCap, 30, 2, true), "marketCap":formatAmount(alpMarketCap, 30, 2, true)})
    })

})

module.exports = router;