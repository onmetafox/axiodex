const router = require('express').Router()

const { ethers, BigNumber } = require("ethers")
const abiToken = require('../abi/Token.json')
const abiUniswapPaire = require('../abi/UniswapV2Pair.json')
const abiVault = require('../abi/Vault.json')
const contracts = require('../contracts.json')

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

router.get('/price', (req, res) => {
    const uniswapAxnUsdcPoolContract = new ethers.Contract(contracts.UniswapAxnUsdcPool, abiUniswapPaire, provider);
    const vaultContract = new ethers.Contract(contracts.Vault, abiVault, provider)

    uniswapAxnUsdcPoolContract.getReserves().then(data => {
        let axnPrice = 0;
        const {reserve0, reserve1} = data || {};
        const isAxnUsdc = contracts.AXN.toLowerCase() < contracts.USDC.toLowerCase()
        const axnReserve = isAxnUsdc ? reserve0 : reserve1
        const usdcReserve = isAxnUsdc ? reserve1 : reserve0

        vaultContract.getMinPrice(contracts.USDC).then(ret => {
            const PRECISION_AXN = BigNumber.from(10).pow(18)
            const PRECISION_USDC = BigNumber.from(10).pow(6)

            if (usdcReserve && axnReserve && ret) {
                axnPrice = usdcReserve.mul(PRECISION_AXN).div(axnReserve).mul(ret).div(PRECISION_USDC);
            }
            return res.json(axnPrice)
        })
    })

})
router.get('/total-supply', (req, res) => {
    const contract = new ethers.Contract(contracts.AXN, abiToken, provider)
    contract.totalSupply().then(result => {
        res.json(result)
    })
})

router.get('/total-staked', (req, res) => {
    const contract = new ethers.Contract(contracts.AXN, abiToken, provider)
    contract.balanceOf(contracts.StakedAxnTracker).then(result => {
        res.json(result)
    })
})

module.exports = router;