require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-contract-sizer")
require('@typechain/hardhat')
const dotenv = require('dotenv')

dotenv.config()
const mnemonic = process.env.BASE_DEPLOYER;
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    localhost: {
      timeout: 120000,
      forking: {
        url: 'https://mainnet.base.org',
      }
    },
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        url: 'https://mainnet.base.org',
      }
    },
    devnet: {
      url: 'http://172.86.96.113/rpc/devnet',
    },
    basetestnet: {
      url: 'https://base-goerli.publicnode.com',
      chainId: 84531,
      accounts: [`${mnemonic}`],
      gasPrice: 20000000000,
    },
    base: {
      url: 'https://mainnet.base.org',
      accounts: [`${mnemonic}`],
      chainId: 8453
    },
    mainnet: {
      url: `https://rpc.flashbots.net`,
      accounts: [`${mnemonic}`],
      chainId: 1
    },
    sepolia: {
      url: `https://rpc.ankr.com/eth_sepolia`,
      accounts: [`${mnemonic}`],
      chainId: 11155111,
    }
  },
  etherscan: {
    apiKey: {
      basetestnet: '625N7GC5238WP837PCH6D9QI6TE1USBPDT',
      base: '625N7GC5238WP837PCH6D9QI6TE1USBPDT',
      ethereum: 'C7MSIMK1FXRGYMB39IHUURH68KIEVDPUH2',
    },
    customChains: [
      {
        network: "basetestnet",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org"
        }
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      }
    ]
  },
  solidity: {
    compilers: [{
      version: "0.6.12",
      settings: {
        optimizer: {
          enabled: true,
          runs: 8
        }
      }
    }, {
      version: "0.8.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }, {
      version: "0.8.16",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }, {
      version: "0.5.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }, {
      version: "0.5.16",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }, {
      version: "0.6.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }, {
      version: "0.6.2",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }, {
      version: "0.6.6",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },
    ]
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  gasReporter: {
    token: "ETH",
    currency: 'USD',
    gasPrice: 50,
    enabled: true,
    coinmarketcap: '0caa3779-3cb2-4665-a7d3-652823b53908'
  }
}
