// price feeds https://docs.chain.link/docs/binance-smart-chain-addresses/
const { expandDecimals } = require("../../test/shared/utilities")

module.exports = {
  bsc: {
    btcPriceFeed: { address: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf" },
    ethPriceFeed: { address: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e" },
    bnbPriceFeed: { address: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE" },
    busdPriceFeed: { address: "0xcBb98864Ef56E9042e7d2efef76141f15731B82f" },
    usdcPriceFeed: { address: "0x51597f405303C4377E36123cBc172b13269EA163" },
    usdtPriceFeed: { address: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320" },
    btc: {
      name: "btc",
      address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      decimals: 18,
      priceFeed: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
      priceDecimals: 8,
      isStrictStable: false
    },
    eth: {
      name: "eth",
      address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
      decimals: 18,
      priceFeed: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
      priceDecimals: 8,
      isStrictStable: false
    },
    bnb: {
      name: "bnb",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
      priceFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
      priceDecimals: 8,
      isStrictStable: false
    },
    busd: {
      name: "busd",
      address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
      decimals: 18,
      priceFeed: "0xcBb98864Ef56E9042e7d2efef76141f15731B82f",
      priceDecimals: 8,
      isStrictStable: true
    },
    usdc: {
      name: "usdc",
      address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      decimals: 18,
      priceFeed: "0x51597f405303C4377E36123cBc172b13269EA163",
      priceDecimals: 8,
      isStrictStable: true
    },
    usdt: {
      name: "usdt",
      address: "0x55d398326f99059fF775485246999027B3197955",
      decimals: 18,
      priceFeed: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
      priceDecimals: 8,
      isStrictStable: true
    },
    nativeToken: {
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18
    }
  },
  testnet: {
    btcPriceFeed: { address: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C" },
    ethPriceFeed: { address: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7" },
    bnbPriceFeed: { address: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526" },
    busdPriceFeed: { address: "0x8F460c4F4Fa9F87AeA4f29B4Ee91d1b8e97163BA" },
    usdcPriceFeed: { address: " 0x90c069C4538adAc136E051052E14c1cD799C41B7" },
    usdtPriceFeed: { address: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620" },
    btc: {
      address: "0xb19C12715134bee7c4b1Ca593ee9E430dABe7b56",
      decimals: 18
    },
    eth: {
      address: "0x1958f7C067226c7C8Ac310Dc994D0cebAbfb2B02",
      decimals: 18
    },
    bnb: {
      address: "0x612777Eea37a44F7a95E3B101C39e1E2695fa6C2",
      decimals: 18
    },
    busd: {
      address: "0x3F223C4E5ac67099CB695834b20cCd5E5D5AA9Ef",
      decimals: 18
    },
    usdc: {
      address: "0x9780881bf45b83ee028c4c1de7e0c168df8e9eef",
      decimals: 18
    },
    usdt: {
      address: "0x337610d27c682e347c9cd60bd4b3b107c9d34ddd",
      decimals: 18
    },
    nativeToken: {
      address: "0x612777Eea37a44F7a95E3B101C39e1E2695fa6C2",
      decimals: 18
    }
  },
  arbitrumTestnet: {
    // https://docs.chain.link/docs/arbitrum-price-feeds/
    btcPriceFeed: { address: "0x0c9973e7a27d00e656B9f153348dA46CaD70d03d" },
    ethPriceFeed: { address: "0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8" },
    usdtPriceFeed: { address: "0xb1Ac85E779d05C2901812d812210F6dE144b2df0" },
    usdcPriceFeed: { address: "0xb1Ac85E779d05C2901812d812210F6dE144b2df0" }, // this is USDT price feed, chainlink doesn't have one for USDC
    btc: {
      address: "0xab952e6801daB7920B65b8aC918FF0F66a8a0F44",
      decimals: 18
    },
    eth: {
      address: "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681",
      decimals: 18
    },
    usdc: {
      address: "0xb93cb5F5c6a56e060A5e5A9691229D2a7e2D234A",
      decimals: 18
    },
    usdt: {
      address: "0xaB7ee1A7D5bc677e3A7ac694f2c156b3fFCaABC1",
      decimals: 18
    },
    nativeToken: {
      address: "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681",
      decimals: 18
    }
  },
  arbitrum: {
    btc: {
      name: "btc",
      address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      decimals: 8,
      priceFeed: "0x6ce185860a4963106506C203335A2910413708e9",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 15000,
      minProfitBps: 0,
      maxUsdgAmount: 72 * 1000 *1000,
      bufferAmount: 2000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 25 * 1000 * 1000,
      maxGlobalShortSize: 25 * 1000 * 1000,
    },
    eth: {
      name: "eth",
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18,
      priceFeed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 35000,
      minProfitBps: 0,
      maxUsdgAmount: 150 * 1000 * 1000,
      bufferAmount: 65000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 40 * 1000 * 1000,
      maxGlobalShortSize: 40 * 1000 * 1000,
    },
    usdc: {
      name: "usdc",
      address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      decimals: 6,
      priceFeed: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 39000,
      minProfitBps: 0,
      maxUsdgAmount: 180 * 1000 * 1000,
      bufferAmount: 100 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    link: {
      name: "link",
      address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      decimals: 18,
      priceFeed: "0x86E53CF1B870786351Da77A57575e79CB55812CB",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 6 * 1000 * 1000,
      bufferAmount: 200000,
      isStable: false,
      isShortable: true,
      spreadBasisPoints: 20,
      maxGlobalShortSize: 500 * 1000,
      maxGlobalLongSize: 500 * 1000
    },
    uni: {
      name: "uni",
      address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      decimals: 18,
      priceFeed: "0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 100000,
      isStable: false,
      isShortable: true,
      spreadBasisPoints: 20,
      maxGlobalShortSize: 500 * 1000,
      maxGlobalLongSize: 500 * 1000
    }, 
    usdt: {
      name: "usdt",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
      priceFeed: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 2000,
      minProfitBps: 0,
      maxUsdgAmount: 10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    mim: {
      name: "mim",
      address: "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A",
      decimals: 18,
      priceFeed: "0x87121F6c9A9F6E90E59591E4Cf4804873f54A95b",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 1,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false
    },
    frax: {
      name: "frax",
      address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
      decimals: 18,
      priceFeed: "0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 2000,
      minProfitBps: 0,
      maxUsdgAmount: 8 * 1000 * 1000,
      bufferAmount: 0,
      isStable: true,
      isShortable: false
    },
    dai: {
      name: "dai",
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      priceFeed: "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 5000,
      minProfitBps: 0,
      maxUsdgAmount: 25 * 1000 * 1000,
      bufferAmount: 6 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    nativeToken: {
      name: "weth",
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18
    }
  },
  goerli: {
    eth: {
      name: "eth",
      address: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
      decimals: 18,
      priceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 5500,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 15 * 1000 * 1000,
      maxGlobalShortSize: 10 * 1000 * 1000
    },
    btc: {
      name: "btc",
      address: "0x9c556b18d2370d4c44f3b3153d340d9abfd8d995",
      decimals: 8,
      priceFeed: "0xA39434A63A52E749F02807ae27335515BA4b07F7",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 3000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 100,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 10 * 1000 * 1000,
      maxGlobalShortSize: 1000
    },
    usdc: {
      name: "usdc",
      address: "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
      decimals: 6,
      priceFeed: "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 45000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 15 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    // usdt: {
    //   name: "usdt",
    //   address: "0x1cfd6813a59d7b90c41dd5990ed99c3bf2eb8f55",
    //   decimals: 6,
    //   priceFeed: "",
    //   priceDecimals: 8,
    //   isStrictStable: true,
    //   tokenWeight: 2000,
    //   minProfitBps: 0,
    //   maxUsdgAmount: 10 * 1000 * 1000,
    //   bufferAmount: 1 * 1000 * 1000,
    //   isStable: true,
    //   isShortable: false
    // },
    // dai: {
    //   name: "dai",
    //   address: "0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844",
    //   decimals: 18,
    //   priceFeed: "0x0d79df66BE487753B02D015Fb622DED7f0E9798d",
    //   priceDecimals: 8,
    //   isStrictStable: true,
    //   tokenWeight: 5000,
    //   minProfitBps: 0,
    //   maxUsdgAmount: 25 * 1000 * 1000,
    //   bufferAmount: 6 * 1000 * 1000,
    //   isStable: true,
    //   isShortable: false
    // },
    nativeToken: {
      name: "eth",
      address: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
      decimals: 18
    }
  },
  polygonMumbai: {
    matic: {
      name: "matic",
      address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
      decimals: 18,
      priceFeed: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 7000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 *1000,
      bufferAmount: 200000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 2 * 1000 * 1000,
      maxGlobalShortSize: 1 * 1000 * 1000,
    },
    eth: {
      name: "eth",
      address: "0x40155AD14A14C6F7A3116dafb279160D9761c606",
      decimals: 18,
      priceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 5500,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 15 * 1000 * 1000,
      maxGlobalShortSize: 10 * 1000 * 1000
    },
    btc: {
      name: "btc",
      address: "0xc31BeaD1BA4Cc9594e66DB66DC073c8e0eD17E41",
      decimals: 8,
      priceFeed: "0x007A22900a3B98143368Bd5906f8E17e9867581b",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 3000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 100,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 10 * 1000 * 1000,
      maxGlobalShortSize: 1000
    },
    usdc: {
      name: "usdc",
      address: "0x8f7116CA03AEB48547d0E2EdD3Faa73bfB232538",
      decimals: 6,
      priceFeed: "0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 45000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 15 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    usdt: {
      name: "usdt",
      address: "0xa7e989B6c140C4c3FBe8F15B5f7f7297ADC3bf00",
      decimals: 6,
      priceFeed: "0x92C09849638959196E976289418e5973CC96d645",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 45000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 15 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    nativeToken: {
      name: "matic",
      address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
      decimals: 18
    }
  },
opera: {
    ftm: {
      name: "ftm",
      address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      decimals: 18,
      priceFeed: "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 7000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 *1000,
      bufferAmount: 200000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 2 * 1000 * 1000,
      maxGlobalShortSize: 1 * 1000 * 1000,
    },
    eth: {
      name: "eth",
      address: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
      decimals: 18,
      priceFeed: "0x11DdD3d147E5b83D01cee7070027092397d63658",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 5500,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 15 * 1000 * 1000,
      maxGlobalShortSize: 10 * 1000 * 1000
    },
    btc: {
      name: "btc",
      address: "0x321162Cd933E2Be498Cd2267a90534A804051b11",
      decimals: 8,
      priceFeed: "0x8e94C22142F4A64b99022ccDd994f4e9EC86E4B4",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 3000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 100,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 10 * 1000 * 1000,
      maxGlobalShortSize: 1000
    },
    usdc: {
      name: "usdc",
      address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
      decimals: 6,
      priceFeed: "0x2553f4eeb82d5A26427b8d1106C51499CBa5D99c",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 45000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 15 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    usdt: {
      name: "usdt",
      address: "0x049d68029688eAbF473097a2fC38ef61633A3C7A",
      decimals: 6,
      priceFeed: "0xF64b636c5dFe1d3555A847341cDC449f612307d0",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 45000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 15 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    nativeToken: {
      name: "ftm",
      address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      decimals: 18
    }
  },
  avax: {
    avax: {
      name: "avax",
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      decimals: 18,
      priceFeed: "0x0A77230d17318075983913bC2145DB16C7366156",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 7000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 *1000,
      bufferAmount: 200000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 2 * 1000 * 1000,
      maxGlobalShortSize: 1 * 1000 * 1000,
      spreadBasisPoints: 10
    },
    eth: {
      name: "eth",
      address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      decimals: 18,
      priceFeed: "0x976B3D034E162d8bD72D6b9C989d545b839003b0",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 5500,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 15 * 1000 * 1000,
      maxGlobalShortSize: 10 * 1000 * 1000
    },
    btcb: {
      name: "btcb",
      address: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
      decimals: 8,
      priceFeed: "0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 300,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 15 * 1000 * 1000,
      maxGlobalShortSize: 10 * 1000 * 1000
    },
    btc: {
      name: "btc",
      address: "0x50b7545627a5162f82a992c33b87adc75187b218",
      decimals: 8,
      priceFeed: "0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 3000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 100,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 10 * 1000 * 1000,
      maxGlobalShortSize: 1000
    },
    mim: {
      name: "mim",
      address: "0x130966628846BFd36ff31a822705796e8cb8C18D",
      decimals: 18,
      priceFeed: "0x54EdAB30a7134A16a54218AE64C73e1DAf48a8Fb",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 1,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false
    },
    usdc: {
      name: "usdc",
      address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      decimals: 6,
      priceFeed: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 45000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 15 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    usdce: {
      name: "usdce",
      address: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
      decimals: 6,
      priceFeed: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 5000,
      minProfitBps: 0,
      maxUsdgAmount: 10 * 1000 * 1000,
      bufferAmount: 2 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    nativeToken: {
      name: "wavax",
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      decimals: 18
    }
  },
  puppynet: {
    bone: {
      name: "bone",
      address: "0x888888888030F38cF1CdA6aD34cCCcB0f83Cd86a",
      decimals: 18,
      priceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 5500,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 15 * 1000 * 1000,
      maxGlobalShortSize: 10 * 1000 * 1000
    },
    btc: {
      name: "btc",
      address: "0xc7e716fc607d993f969510d9409c08d0ff9cf35b",
      decimals: 8,
      priceFeed: "0xA39434A63A52E749F02807ae27335515BA4b07F7",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 3000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 100,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 10 * 1000 * 1000,
      maxGlobalShortSize: 1000
    },
    usdc: {
      name: "usdc",
      address: "0x9e29510A0fd59dff54BD64C778062f3d32E94C28",
      decimals: 6,
      priceFeed: "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 45000,
      minProfitBps: 0,
      maxUsdgAmount: 50 * 1000 * 1000,
      bufferAmount: 15 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    usdt: {
      name: "usdt",
      address: "0xa6913476403ce2ccc331b8952d3ee974ed8bea9b",
      decimals: 6,
      priceFeed: "",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 2000,
      minProfitBps: 0,
      maxUsdgAmount: 10 * 1000 * 1000,
      bufferAmount: 1 * 1000 * 1000,
      isStable: true,
      isShortable: false
    },
    // dai: {
    //   name: "dai",
    //   address: "0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844",
    //   decimals: 18,
    //   priceFeed: "0x0d79df66BE487753B02D015Fb622DED7f0E9798d",
    //   priceDecimals: 8,
    //   isStrictStable: true,
    //   tokenWeight: 5000,
    //   minProfitBps: 0,
    //   maxUsdgAmount: 25 * 1000 * 1000,
    //   bufferAmount: 6 * 1000 * 1000,
    //   isStable: true,
    //   isShortable: false
    // },
    nativeToken: {
      name: "bone",
      address: "0x888888888030F38cF1CdA6aD34cCCcB0f83Cd86a",
      decimals: 18
    }
  },
}
