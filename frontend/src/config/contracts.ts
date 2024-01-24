import { ethers } from "ethers";
import { MAINNET, TESTNET, LOCALNET, DEFAULT_CHAIN_ID } from "./chains";

const { AddressZero } = ethers.constants;

export const XGMT_EXCLUDED_ACCOUNTS = [
];

const CONTRACTS = {
  [MAINNET]: {
    "NATIVE_TOKEN": "0x4200000000000000000000000000000000000006",
    "HEX": "0x09A1D6BbeC3cb0474Bd19eF88D3D3514f189c545",
    "USDC": "0xeDc16F500dBb061449Fb46A6AB4701F9310c3928",
    "BTC": "0x795356E1B93190aB641C711b7c69E56eaC4522c0",
    "TokenManager": "0xdA04b9825C3829B46f8d7ba3157c40F60e846CfB",
    "Multicall3": "0x7850DeaaE887B66BfBf09Be79D17f76b242A8358",
    "Vault": "0x318489fbF2b3a70d4ba7346E11f58A6C2D9FaBA1",
    "USDG": "0x17C0c2A06d98d635b1de1F1c675170700b979Ab0",
    "Router": "0xE789C215390B0F573E0A92A5ab3AFb743dDE7dCA",
    "VaultPriceFeed": "0x43D327CE32579BE1584924DAF73a380B4F0d792a",
    "ALP": "0x5d1c395A679a21aFB029C23Cc8373a18530654Ee",
    "ShortsTracker": "0xf027fF6998EcAF544aD9d2812AF36c08CDB9aAa5",
    "AlpManager": "0xe0f5ABCdD0085a39D40E40D473896a134C2221Ee",
    "VaultErrorController": "0x4C91A5B603f9e0209ee543898e93CEBB8CBF69Be",
    "VaultUtils": "0xeFfCB3E8aDBBef3d752F32b4852AaD579073aD5d",
    "PriceFeedBTC": "0xCCADC697c55bbB68dc5bCdf8d3CBe83CdD4E071E",
    "PriceFeedETH": "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    "PriceFeedUSDC": "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
    "PriceFeedHEX": "0x94F3C1F777B5410964E94f79d7B95E4A142FF0E8",
    "OrderBook": "0x5D524F714b34E967D3c3B154443318244D6b8748",
    "OrderExecutor": "0x2ec0fA6973ec3CEb6dF75182d8D7Bff24272c150",
    "AXN": "0x2f602FF207C541969D17d2A3b5F17A22A38e2e6d",
    "EsAXN": "0xC61E4368d4B1dE580B345B9Bf21E5A94C18722C4",
    "BnAXN": "0xe1F3B633BE4a3e075AE34a27EEDc9df589EfA07b",
    "StakedAxnTracker": "0x6b4E7EAA6A3839978281b55c07771BE9a527883e",
    "StakedAxnDistributor": "0x9d545C1DA4F446910d1a7B14aE600042284d5AA6",
    "BonusAxnTracker": "0x5Ed555920535E2f93607E7690FdD3F0709954A43",
    "BonusAxnDistributor": "0xf461fdFf98C51cA32159e5B561f53ba974b3ff17",
    "FeeAxnTracker": "0xD4B8a57C7fC235c13a88bF9f216677de1799dD95",
    "FeeAxnDistributor": "0x5597162ef3C372C79b6cEB8E172a5D828Ff7E68c",
    "FeeAlpTracker": "0x3FeaC0a5ddBC4Ad65Fc957e40836fe83D5Cf7076",
    "FeeAlpDistributor": "0xe392786CbEec3d23f280928b1536BB83C773bA7a",
    "StakedAlpTracker": "0x8005fC174E7Bd61AC1162B94C92cB972EAe00e51",
    "StakedAlpDistributor": "0x8553155e04cb6Fe9777E7362817df50a3BDA24D8",
    "AxnVester": "0x9746b588c97A340eF6cA17295C04D94f0ED62Db7",
    "AlpVester": "0xbEca748075276e4315f926f42AA7c9846c98B27D",
    "RewardRouter": "0x5A1002E3c609A3f95276ca11C13Ea5802CcC23f5",
    "AlpRewardRouter": "0x5739d02CFA2B5A839E3251237ae3Dbd7aA4C1a24",
    "TimeLock": "0x8b78ace71cb5497623f98f27cb92017963E875fC",
    "PositionManager": "0xDA5cea3908C1950435D428c477066142263BFFDB",
    "PositionRouter": "0xDF813e6D2d57cecB49d3707510479425296c7aae",
    "ReferralReader": "0x0FD1FF163692732A3c37aEDa64a2F0dA148F2b69",
    "ReferralStorage": "0xD4e31aEF59241a037aa484a9E5Fa8699Bb5bFcd1",
    "PriceFeedTimelock": "0x142be7d8DA853Acaa4a26D97Dc3602808fccEeDD",
    "FastPriceEvents": "0xE207F1E760B11088Ad0df3BA840278525c897fBC",
    "SecondaryPriceFeed": "0x8141E4Ff72cE45036d0E3eaD64732912ACbEC328",
    "StakeManager": "0xBBE9709572BAb2074f3cB951Cf23b36eF0a3BFAD",
    "StakedAlp": "0x052B66ed9740D935376661a6fF96112843794c57",
    "AlpBalance": "0x0d238A791c4A19C43d07Ba5A02778c045B96dC6e",
    "BalanceUpdater": "0x7C46D9A8310574B8cCcdA70C6a6463D835314f42",
    "BatchSender": "0x6638Ac691bC282D0C182C28cfe9fC078A6b4489A",
    "VaultReader": "0xD6B22A186181a94F3470978340cffA6564Ab4152",
    "ShortsTrackerTimelock": "0xA2e58a025FfB9A8c6bCd65bd839030488b656124",
    "RewardReader": "0xD572f5942238ee8Ace2C7A927b871C52297E3FFf",
    "Reader": "0x61E542742B8787Cdb80E8b9b91FE75b85F5b481d",
    "OrderBookReader": "0x33a409817d9f482B0416ecB4D7996B3694021A5C",
    "AxnTimelock": "0x027c9BcB50652d28173308c6AAbd9F0ecaa0c118",
    "EsAxnBatchSender": "0x76cBe28fe5bCd0d5090AA288D7B3089e7e24C6C4",
    "PancakeFactory": "0xE53151dAEB639b3298e07fe519F309d3D5F4820E",
    "PancakeRouter": "0xa548669619d5Db9F51c2b3D6C7e85F8830ebFEe4",
    "UniswapAxnUsdcPool": "0x41E9a4Eb9B7572C03AA3c3Fe9914436F4022D4fC",
    "LiquidityLocker": "0xC95b0535A1AA7C5a4e53A703eE8024471f70817D",
    "EsAxnIOU": "0x0000000000000000000000000000000000000000",
    "MummyClubNFT": AddressZero,
    "MummyClubNFTStaking": AddressZero,
    "MummyClubSale": AddressZero,
    "MummyClubVester": AddressZero,
    "L1StandardBridge": "0x0",
    "L2StandardBridge": "0x0",
    "L2ToL1MessagePasser": "0x0",
    "L2OutputOracle": "0x0",
    "OptimismPortal": "0x0"
  },
  [TESTNET]: {
    "NATIVE_TOKEN": "0x4200000000000000000000000000000000000006",
    "HEX": "0x273dC19677dB9f317bADdd8e979494f5Ef2372DC",
    "USDC": "0xe5719eE1F5882CCf70FC0833Ec7F7Ec2c4Ef947e",
    "BTC": "0x17D8bbA196F61238bA96f230Ff7707a2917cDF8e",
    "TokenManager": "0x9022165a37f62A29f4D72143A830a42b670d2aE5",
    "Multicall3": "0x75a6DD9a6909432e9389976738a13b9946649881",
    "Vault": "0x084c0c767279e0b36Eb406596E54095b3F0e300c",
    "USDG": "0x3c96f3f8A4b17468748f18Bb1274B6c5CD905607",
    "Router": "0x48d660f41dc6C9D866926e01B76DD38de19e7C00",
    "VaultPriceFeed": "0xe1B554E70e3e3bAAee70f0E8bA6b227477cfaee3",
    "ALP": "0x23D6665dE1a93E4c9770696b5F76755b8113Df86",
    "ShortsTracker": "0xf345D031a09A58f59322c7629965EbA3f125e747",
    "AlpManager": "0x3E229d113eff00E0e77813e6659a734D708d9688",
    "VaultErrorController": "0x33F72577f06771b8a8c4bF79091153aD7dDaBA3e",
    "VaultUtils": "0xEC454E67aEfEc8a87E0B65553C96686a61342C62",
    "PriceFeedBTC": "0xAC15714c08986DACC0379193e22382736796496f",
    "PriceFeedETH": "0xcD2A119bD1F7DF95d706DE6F2057fDD45A0503E2",
    "PriceFeedUSDC": "0xb85765935B4d9Ab6f841c9a00690Da5F34368bc0",
    "PriceFeedHEX": "0x952FDcd6AEA0FCc124Dd50B433AAb1d82b006C62",
    "OrderBook": "0x2C234841fae0EB833518376c85cBA3Ae3e210B33",
    "OrderExecutor": "0x05D594fc77aFbff99D3C57aeb12639773749eb39",
    "AXN": "0x702dcf7C0F60E4e1e5d3CEAaD2B5b67deA31C2dE",
    "EsAXN": "0x07DeD9aC2BB14Fc9b8059159ad3fD1cE28302fAD",
    "BnAXN": "0xeF02bE718c1A139fD586d5531af021e4C0E71278",
    "StakedAxnTracker": "0x6FBDb83F8C806444A3E02C171683B435FdFc473A",
    "StakedAxnDistributor": "0xC26853aAcEf3E5A4D4F8f8969069Ae8a072922Cf",
    "BonusAxnTracker": "0x4caE549e75Bf20Cc692039b98d777a76F5222eab",
    "BonusAxnDistributor": "0x8A0a0C7FA9b7dfE1E431F50D1407b0Ad8F4D50bb",
    "FeeAxnTracker": "0x65aeCED38E89E7Bb1aAFCE065144F349ba43C41F",
    "FeeAxnDistributor": "0xc5268eeC8cA6d1271026a024b59F9b02e7932C95",
    "FeeAlpTracker": "0x1a58702317A427fAe20Aa53553fAfbb34D8F618E",
    "FeeAlpDistributor": "0xcF64Cd5A1975f5aa40d5953A5EFe9e7568657507",
    "StakedAlpTracker": "0xE3170FbD8E3Fe95F11f8e770D7Bb2bc10dbB684c",
    "StakedAlpDistributor": "0xDcE6dc4Baf46A5b53b842210b42A64BE9a870833",
    "AxnVester": "0xa4844e181fbe109f02B44cbd56CA09cfdFB5a367",
    "AlpVester": "0x43796cA505542A3EAD801F1f0245F9C6481676B7",
    "RewardRouter": "0x1977Fd6B7E3CbD2cF12698d866DD9b16E7e442c0",
    "AlpRewardRouter": "0x89AbAe2a0040B8C390D543A0F05C303C79844c20",
    "TimeLock": "0xFAeC262CB26aA3038E3ac6269e6B6b77734AB364",
    "PositionManager": "0x606a4d3BAdC1dc00cc7b4D828a3DeE6Df19a2ca1",
    "PositionRouter": "0x29C973401298772BC78ecc12E548Ce12C3241874",
    "ReferralReader": "0x84C5763A23b16c4973DCF900f93897EE0e1a22c2",
    "ReferralStorage": "0x8cd17b63c989be499bb070fb6c6c32361Fb86404",
    "PriceFeedTimelock": "0xe6e50FC41903BD8f14e0441cbc9bd9C08044B3E3",
    "FastPriceEvents": "0x3839b021967C8127c28a3cBa4A9a1304CDfd4767",
    "SecondaryPriceFeed": "0x573821D1097103B49df7d1467F9ce938402C4621",
    "StakeManager": "0xb3D5D3562faD19eE429e0Fd31deb09325B50Ac36",
    "StakedAlp": "0xCb941B5525394aD4645c6081a26Db7eC2D414596",
    "AlpBalance": "0x65D800DDc74A4ec242c325Cfdac672399a2BF7F4",
    "BalanceUpdater": "0xd000480026731D1d51F4ed0F12B9E3643ca7d333",
    "BatchSender": "0xc61b448b519Db0Ae9E50c723963C628DE923E2E0",
    "VaultReader": "0x8B8e24415B302AbDE2B2F49AD6c64Eb14CD82e2C",
    "ShortsTrackerTimelock": "0xE722f07Ee3EFF75bb800FEe81C08F59C4b417820",
    "RewardReader": "0xB619a2FeeE57cd574B005E3773e80154516439BB",
    "Reader": "0x12351222Fc3640212861Fe5E8950119604Cb3Ef5",
    "OrderBookReader": "0x2595a6005c1cfdab20286e841b6EfC668b2Fb0C3",
    "AxnTimelock": "0x717B0f242302FDc592bb0d2BD706b4CAEdA8AB83",
    "EsAxnBatchSender": "0xf3DEEBd6705527d242eD5331379Eb6C4c14186b0",
    "PancakeFactory": "0x6C75f291c5eeEE67E8060773654442447CBb9089",
    "PancakeRouter": "0x48547A70B82D4123125CD8ff3f69f328561e7025",
    "UniswapAxnUsdcPool": "0xf1551573eA5B9985D4131b7DEd6CC1A5529A0897",
    "LiquidityLocker": "0x06CE13814c7629B647249613A7EdF64a24b7237b",
    "EsAxnIOU": "0x0000000000000000000000000000000000000000",
    "L1StandardBridge": "0xFe0C2063146E0dFB1E27fc25918a2058bf5c2554",
    // "L1StandardBridge": "0xfA6D8Ee5BE770F84FC001D098C4bD604Fe01284a",
    "AirDropToken": "0x17D51660e6aC18B6F5354cc1F31bc9863829fd54",
    "AirDrop": "0x80411129942F4A35175CC923241C18887F950045",
    "L2StandardBridge": "0x4200000000000000000000000000000000000010",
    "L2ToL1MessagePasser": "0x4200000000000000000000000000000000000016",
    "L2OutputOracle": "0x2A35891ff30313CcFa6CE88dcf3858bb075A2298",
    "OptimismPortal": "0xe93c8cD0D409341205A592f8c4Ac1A5fe5585cfA"
    // "MummyClubNFT": "0x0000000000000000000000000000000000000000",
    // "MummyClubNFTStaking": "0x0000000000000000000000000000000000000000",
    // "MummyClubSale": "0x0000000000000000000000000000000000000000",
    // "MummyClubVester": "0x0000000000000000000000000000000000000000"
  },
  [LOCALNET]: {
    "EsAxnIOU": "0x0000000000000000000000000000000000000000",
    "NATIVE_TOKEN": "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    "HEX": "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
    "USDC": "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
    "BTC": "0x9A676e781A523b5d0C0e43731313A708CB607508",
    "TokenManager": "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
    "Multicall3": "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
    "Vault": "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
    "USDG": "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
    "Router": "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d",
    "VaultPriceFeed": "0x59b670e9fA9D0A427751Af201D676719a970857b",
    "ALP": "0x4A679253410272dd5232B3Ff7cF5dbB88f295319",
    "ShortsTracker": "0x09635F643e140090A9A8Dcd712eD6285858ceBef",
    "AlpManager": "0xc5a5C42992dECbae36851359345FE25997F5C42d",
    "VaultErrorController": "0xf5059a5D33d5853360D16C683c16e67980206f36",
    "VaultUtils": "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49",
    "PriceFeedETH": "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf",
    "PriceFeedBTC": "0x9d4454B023096f34B160D6B654540c56A1F81688",
    "PriceFeedUSDC": "0x809d550fca64d94Bd9F66E60752A544199cfAC3D",
    "PriceFeedHEX": "0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154",
    "OrderBook": "0xc351628EB244ec633d5f21fBD6621e1a683B1181",
    "OrderExecutor": "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc",
    "AXN": "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f",
    "EsAXN": "0x162A433068F51e18b7d13932F27e66a3f99E6890",
    "BnAXN": "0x922D6956C99E12DFeB3224DEA977D0939758A1Fe",
    "StakedAxnTracker": "0xdbC43Ba45381e02825b14322cDdd15eC4B3164E6",
    "StakedAxnDistributor": "0x04C89607413713Ec9775E14b954286519d836FEf",
    "BonusAxnTracker": "0x2E2Ed0Cfd3AD2f1d34481277b3204d807Ca2F8c2",
    "BonusAxnDistributor": "0xD8a5a9b31c3C0232E196d518E89Fd8bF83AcAd43",
    "FeeAxnTracker": "0x0355B7B8cb128fA5692729Ab3AAa199C1753f726",
    "FeeAxnDistributor": "0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB",
    "FeeAlpTracker": "0x4EE6eCAD1c2Dae9f525404De8555724e3c35d07B",
    "FeeAlpDistributor": "0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25",
    "StakedAlpTracker": "0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d",
    "StakedAlpDistributor": "0x46b142DD1E924FAb83eCc3c08e4D46E82f005e0E",
    "AxnVester": "0x4b6aB5F819A515382B0dEB6935D793817bB4af28",
    "AlpVester": "0xCace1b78160AE76398F486c8a18044da0d66d86D",
    "RewardRouter": "0xc0F115A19107322cFBf1cDBC7ea011C19EbDB4F8",
    "AlpRewardRouter": "0xF32D39ff9f6Aa7a7A64d7a4F00a54826Ef791a55",
    "TimeLock": "0xD42912755319665397FF090fBB63B1a31aE87Cee",
    "PositionManager": "0xa6e99A4ED7498b3cdDCBB61a6A607a4925Faa1B7",
    "PositionRouter": "0x870526b7973b56163a6997bB7C886F5E4EA53638",
    "ReferralReader": "0x66F625B8c4c635af8b74ECe2d7eD0D58b4af3C3d",
    "ReferralStorage": "0x8bCe54ff8aB45CB075b044AE117b8fD91F9351aB",
    "PriceFeedTimelock": "0xddE78e6202518FF4936b5302cC2891ec180E8bFf",
    "FastPriceEvents": "0x2b5A4e5493d4a54E717057B127cf0C000C876f9B",
    "SecondaryPriceFeed": "0x413b1AfCa96a3df5A686d8BFBF93d30688a7f7D9",
    "StakeManager": "0x54B8d8E2455946f2A5B8982283f2359812e815ce",
    "StakedAlp": "0xf090f16dEc8b6D24082Edd25B1C8D26f2bC86128",
    "AlpBalance": "0xE8addD62feD354203d079926a8e563BC1A7FE81e",
    "BalanceUpdater": "0xe039608E695D21aB11675EBBA00261A0e750526c",
    "BatchSender": "0x071586BA1b380B00B793Cc336fe01106B0BFbE6D",
    "VaultReader": "0xe70f935c32dA4dB13e7876795f1e175465e6458e",
    "ShortsTrackerTimelock": "0x3C15538ED063e688c8DF3d571Cb7a0062d2fB18D",
    "RewardReader": "0x3904b8f5b0F49cD206b7d5AABeE5D1F37eE15D8d",
    "Reader": "0x2Dd78Fd9B8F40659Af32eF98555B8b31bC97A351",
    "OrderBookReader": "0x56fC17a65ccFEC6B7ad0aDe9BD9416CB365B9BE8",
    "AxnTimelock": "0x2625760C4A8e8101801D3a48eE64B2bEA42f1E96",
    "EsAxnBatchSender": "0xFE5f411481565fbF70D8D33D992C78196E014b90",
    "PancakeFactory": "0x7B4f352Cd40114f12e82fC675b5BA8C7582FC513",
    "PancakeRouter": "0xcE0066b1008237625dDDBE4a751827de037E53D2",
    "UniswapAxnUsdcPool": "0xF737DbE3d142Cba659617fd13B6E98152e46B795",
    "LiquidityLocker": "0xC7143d5bA86553C06f5730c8dC9f8187a621A8D4",
    "AirDropToken": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "AirDrop": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "L1StandardBridge": "0x0000000000000000000000000000000000000000",
    // "L1StandardBridge": "0xfA6D8Ee5BE770F84FC001D098C4bD604Fe01284a",
    "L2StandardBridge": "0x0000000000000000000000000000000000000000",
    "L2ToL1MessagePasser": "0x0000000000000000000000000000000000000000",
    "L2OutputOracle": "0x0000000000000000000000000000000000000000",
    "OptimismPortal": "0x0000000000000000000000000000000000000000"
  },
};

export function getContract(name: string): string {
  if (!CONTRACTS[DEFAULT_CHAIN_ID]) {
    throw new Error(`Unknown chainId ${DEFAULT_CHAIN_ID}`);
  }

  if (!CONTRACTS[DEFAULT_CHAIN_ID][name]) {
    throw new Error(`Unknown contract "${name}" for chainId ${DEFAULT_CHAIN_ID}`);
  }

  return CONTRACTS[DEFAULT_CHAIN_ID][name];
}
