import { ethers } from "ethers";
import { MAINNET, TESTNET, LOCALNET, DEFAULT_CHAIN_ID } from "./chains";

const { AddressZero } = ethers.constants;

export const XGMT_EXCLUDED_ACCOUNTS = [
];

const CONTRACTS = {
  [MAINNET]: {
    "NATIVE_TOKEN": "0x70499adEBB11Efd915E3b69E700c331778628707",
    "BTC": "0xD2D5e508C82EFc205cAFA4Ad969a4395Babce026",
    "ETH": "0x2b639Cc84e1Ad3aA92D4Ee7d2755A6ABEf300D72",
    "DAI": "0x6533158b042775e2FdFeF3cA1a782EFDbB8EB9b1",
    "USDC": "0x73C68f1f41e4890D06Ba3e71b9E9DfA555f1fb46",
    "Vault": "0x7bdd3b028C4796eF0EAf07d11394d0d9d8c24139",
    "Router": "0x47c05BCCA7d57c87083EB4e586007530eE4539e9",
    "VaultReader": "0x0B32a3F8f5b7E5d315b9E52E640a49A89d89c820",
    "Reader": "0xb6057e08a11da09a998985874FE2119e98dB3D5D",
    "GlpManager": "0x1eB5C49630E08e95Ba7f139BcF4B9BA171C9a8C7",
    "RewardRouter": "0xd9abC93F81394Bd161a1b24B03518e0a570bDEAd",
    "GlpRewardRouter": "0x4653251486a57f90Ee89F9f34E098b9218659b83",
    "RewardReader": "0x057cD3082EfED32d5C907801BF3628B27D88fD80",
    "GLP": "0x532802f2F9E0e3EE9d5Ba70C35E1F43C0498772D",
    "GMX": "0x59C4e2c6a6dC27c259D6d067a039c831e1ff4947",
    "ES_GMX": "0x687bB6c57915aa2529EfC7D2a26668855e022fAE",
    "BN_GMX": "0x49149a233de6E4cD6835971506F47EE5862289c1",
    "USDG": "0xB468647B04bF657C9ee2de65252037d781eABafD",
    "ES_GMX_IOU": AddressZero,
    "StakedGmxTracker": "0x85495222Fd7069B987Ca38C2142732EbBFb7175D",
    "BonusGmxTracker": "0x2498e8059929e18e2a2cED4e32ef145fa2F4a744",
    "FeeGmxTracker": "0x4ea0Be853219be8C9cE27200Bdeee36881612FF2",
    "StakedGlpTracker": "0xce830DA8667097BB491A70da268b76a081211814",
    "FeeGlpTracker": "0xc1EeD9232A0A44c2463ACB83698c162966FBc78d",
    "StakedGmxDistributor": "0x3abBB0D6ad848d64c8956edC9Bf6f18aC22E1485",
    "StakedGlpDistributor": "0xD5bFeBDce5c91413E41cc7B24C8402c59A344f7c",
    "GmxVester": "0x38F6F2caE52217101D7CA2a5eC040014b4164E6C",
    "GlpVester": "0xc075BC0f734EFE6ceD866324fc2A9DBe1065CBB1",
    "OrderBook": "0xC0BF43A4Ca27e0976195E6661b099742f10507e5",
    "OrderExecutor": "0x9D3DA37d36BB0B825CD319ed129c2872b893f538",
    "OrderBookReader": "0xad203b3144f8c09a20532957174fc0366291643c",
    "PositionRouter": "0x8B64968F69E669faCc86FA3484FD946f1bBE7c91",
    "PositionManager": "0x92b0d1Cc77b84973B7041CB9275d41F09840eaDd",
    "UniswapMmyFtmPool": AddressZero,
    "UniswapGmxUsdcPool": "0xF9B7d217CB785669ac3457440bBf9AaCa11ac73E",
    "ReferralStorage": "0x18eb8AF587dcd7E4F575040F6D800a6B5Cef6CAf",
    "ReferralReader": "0x0B1a87021ec75fBaE919b1e86b2B1335FFC8F4d3",
    "TimeLock": "0x1B25157F05B25438441bF7CDe38A95A55ccf8E50",
    "SecondaryPriceFeed": "0x4458AcB1185aD869F982D51b5b0b87e23767A3A9",
    "LiquidityLock": AddressZero,
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
    "HEX": "0x95B99F2e7e9af1C9BfaD165B243d8AF318e24583",
    "USDC": "0xa0Ffc16E769A4d6ea90072b05Bb6Ec3b12443B7B",
    "BTC": "0x1c8dE103aeF01bE72b9140911fCC587e217a813c",
    "TokenManager": "0xd2FFc4FE9C46Bd7e1A0874F21443954730AFe9bE",
    "Multicall3": "0x499182feE20B25f1E0dB4704493CAf4fB5777Db7",
    "Vault": "0x0fe870bc7d5d9cFd8b6e079AC3FB5CBfc02Adeb0",
    "USDG": "0x5F53426E34EcbCA75140a421C36bf61357bd7a8F",
    "Router": "0xd6C18c7DED5322B4ccC58e2AdfD09d1b88bDD950",
    "VaultPriceFeed": "0x7F9152B7F14c99DD1B51F661c6f26774B265278f",
    "ALP": "0xfF24054Bc3F4a089b8D1082692a3f03a848e5Fe2",
    "ShortsTracker": "0xc4F25c3669B488428680999AD5c17AAAB61483D7",
    "AlpManager": "0x6d6e921a13916b6DAb1Acca1fbda7b2195FDF7F0",
    "VaultErrorController": "0x89e2CE07C52d3917918F973dAB9755C6168E388a",
    "VaultUtils": "0xdC0F57a20a605fFC77CFa993389aaA276A0C3C66",
    "PriceFeedBTC": "0xAC15714c08986DACC0379193e22382736796496f",
    "PriceFeedETH": "0xcD2A119bD1F7DF95d706DE6F2057fDD45A0503E2",
    "PriceFeedUSDC": "0xb85765935B4d9Ab6f841c9a00690Da5F34368bc0",
    "PriceFeedHEX": "0xD8b8f1a79a16239cE5E542cd9c53065Bb072a2B4",
    "OrderBook": "0x00093a37d28b4D987E6e951D3b5dFED83Eb508B0",
    "OrderExecutor": "0x00629a62B9F76681CE76C7F3CFae067858A69Eb2",
    "AXN": "0x0C15AF7e41e794cDb7E8B35Cca854c5C933C892a",
    "EsAXN": "0xe618a1C155005A65a16aCd2C55F04F50a4b7ee17",
    "BnAXN": "0xcb5142b4a2753c46BA4256447e4D90332319Ba86",
    "StakedAxnTracker": "0xe7A76B1200cBdcC2eDcF40B407Ccb3037469C266",
    "StakedAxnDistributor": "0x9fA2c8543C64821fEF10466fb920967645F6a3F3",
    "BonusAxnTracker": "0x585bA5AA030602812255E5DDf4dBd978fe132a73",
    "BonusAxnDistributor": "0xb98AC49Acd950019c43C7c67A07d48a0B66e6953",
    "FeeAxnTracker": "0x5993146197972C82b25612514653686709E3712a",
    "FeeAxnDistributor": "0xf01748c3071579Ac3DC543863Ff150995C98E9d4",
    "FeeAlpTracker": "0x292d570a3cb2B1A683aF2A8C27342FE82Cdd7cC7",
    "FeeAlpDistributor": "0xB20847E2B23Aeef267e851021177486385E6a270",
    "StakedAlpTracker": "0x08Dbd34a85A5585196dD82E5Fd04C6F881beF086",
    "StakedAlpDistributor": "0xAA1bFaD218fCc7943Ef8bb74f27E6725fF0a6048",
    "AxnVester": "0xba1092963516f448220C0727ea0205fb93113870",
    "AlpVester": "0x79CAd68fF49b5183CfC3924370B317cd878C2c31",
    "RewardRouter": "0xC6CD864DA5a0Cb187E33671F6aBd7C585d3945F8",
    "AlpRewardRouter": "0x6C921e7A5Ae0bb935beCB6cC6DF58b0F9B08a93B",
    "TimeLock": "0x4063EF728Cf71306f5F9BeC04309C1e5e8B55485",
    "PositionManager": "0x054c9aDf1d4EC8d5339D2930C00076e043D889a6",
    "PositionRouter": "0xC2493FC7B823cF32AdC6e316ea27136ad2718f4a",
    "ReferralReader": "0x6B438c8BF7F59c9cDc28A4ec5fB033DBe8EF5d44",
    "ReferralStorage": "0x9E12C069E2a280Ca8135A96E49690251993a7dd6",
    "PriceFeedTimelock": "0x75b163d214b701E3eAd2F517452eCf268FAacAd2",
    "FastPriceEvents": "0xb67cAAC23B4B8615E2Ca3A474eAB459f3190aBb5",
    "SecondaryPriceFeed": "0x89A1Bdf81baCdED2F190599d36DC85CE413caC9D",
    "StakeManager": "0xCe4641537a01393BE85cBcD3BD42b772Fd161f33",
    "StakedAlp": "0xC9896Bb16999586CcfE823adB4AD93C622d74ECC",
    "AlpBalance": "0x39849e5efcBD302447Cbc49aaa4f93D8AD5d5c2F",
    "BalanceUpdater": "0xAD22f6CA695805cfa7Fc32e6c5E16a52B6E0115B",
    "BatchSender": "0x1a124990B9A60dCE8b41cA24f014f2178BD4De07",
    "VaultReader": "0x547C9E62C2b1AAC062fB2e9a1694948dFa31088F",
    "ShortsTrackerTimelock": "0x20eFc3c998F4b0E8A685C381aC8a6b94aA896854",
    "RewardReader": "0xaf77Cf63857210BfaD0B5376F840F8628c5B8D30",
    "Reader": "0x89fD0A15F13f815Ce6B9F3Ab69b0db928224B5b5",
    "OrderBookReader": "0x7a20BC8ac2b93588569FdB7178F061e245cb1Ebb",
    "AxnTimelock": "0x161D3aE75d5A99c316B7a759EF393e28BeF7279d",
    "EsAxnBatchSender": "0x7d42bc588491d54FD3D60eB5F76609d3Fc00369f",
    "PancakeFactory": "0xE473f00F5b7842f87A4b9F28e420AFBd9b741d01",
    "PancakeRouter": "0xcBED3f41A20925f1484a600496E14302388AC2E4",
    "UniswapAxnUsdcPool": "0xe603EE0b0a6E07f72EcE39b41AC6cbd35CB0d086",
    "LiquidityLocker": "0x864E52e23E0DC0D711F6687d9464DF218e60ad52",
    "EsAxnIOU": "0x0000000000000000000000000000000000000000",
    "L1StandardBridge": "0xFe0C2063146E0dFB1E27fc25918a2058bf5c2554",
    // "L1StandardBridge": "0xfA6D8Ee5BE770F84FC001D098C4bD604Fe01284a",
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
