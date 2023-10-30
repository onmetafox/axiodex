const {expect} = require("chai")
const { getStatic } = require("ethers/lib/utils")
const { ethers } = require("hardhat")
const { expandDecimals, getBlockTime, increaseTime, mineBlock, reportGasUsed, newWallet } = require("./shared/utilities")

let owner
let alice
let bob
let clark
let david
const expire = Math.floor(Date.now()/1000)+3600 * 24 * 30;
paymentWindow = 3600

alpManagerAddress = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
usdcAddress = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";
btcAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508";
valutAddress = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
routerAddress = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d"
wethAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e"
priceFeedBTCAddress = "0x9d4454B023096f34B160D6B654540c56A1F81688";
describe("Demo", ()=>{

    it("test", async ()=>{
        [owner, alice, bob, clark, david] = await ethers.getSigners();
        const alpManager = await ethers.getContractAt("AlpManager", alpManagerAddress);
        const usdc = await ethers.getContractAt('GeneralToken', usdcAddress);
        const vault = await ethers.getContractAt('Vault', valutAddress);
        const router = await ethers.getContractAt('Router', routerAddress);
        const native_token = await ethers.getContractAt('WETH', wethAddress);
        const btc = await ethers.getContractAt('GeneralToken', btcAddress);
        const priceFeedBTC = await ethers.getContractAt('PriceFeed', priceFeedBTCAddress);

        console.log('owner', owner.address)
        console.log('alpManager', alpManager.address);
        console.log('USDC', usdc.address)
        console.log('valult', vault.address)
        console.log('router', router.address)
        console.log('native_token', native_token.address)

        console.log('gov', await alpManager.gov())
        console.log('aumAdjustment', await alpManager.aumAddition())
        console.log('aumDeduction', await alpManager.aumDeduction())
        console.log('getAum', await alpManager.getAum(true));
        // await alpManager.setAumAdjustment(29, 17)

        console.log('owner usdc balance', await usdc.balanceOf(owner.address))
        console.log('valut usdc balance', await usdc.balanceOf(vault.address))

        console.log(">> Native Token aprove...")
        // await native_token.approve(router.address, "100000000000000000000")
        console.log(">> native_token mint...")
        // await native_token.deposit({ value: "100000000000000000"})
        console.log(">> router.directPoolDeposit...")
        // await router.directPoolDeposit(native_token.address, "100000000000000000")

        console.log(">> BTC aprove...")
        // await btc.approve(router.address, "10000000000")
        console.log(">> router.directPoolDeposit(btc)...")
        // await router.directPoolDeposit(btc.address, "10000000000")

        console.log(">> BTC setLatestAnser as 30000");
        await priceFeedBTC.setLatestAnswer("3000000000000");

        // console.log('vault usdg', await vault.buyUSDG(usdcAddress, alpManagerAddress))
        // await usdc.mint(expandDecimals(100, 6))
        // await usdc.approve(alpManager.address, expandDecimals(100, 6));
        // await alpManager.setInPrivateMode(false);
        // await alpManager.addLiquidity(usdc.address, expandDecimals(100, 8), expandDecimals(101, 18), expandDecimals(101, 18));
    })
})
