require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: process.env.BLOCKCHAIN_NETWORK,
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        //set this to false if you want localhost to mimick a real blockchain
        auto: true,
        interval: 5000
      }
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 4,
      scanner: 'https://rinkeby.etherscan.io',
      opensea: 'https://testnets.opensea.io',
      accounts: [process.env.BLOCKCHAIN_RINKEBY_PRIVATE_KEY],
      contracts: {
        nft: '0x94488c1c9481361E0eaBbDa44507f25eb8D94b88',
        splitter1: '0xB4802938b69267c2EeE4074275aF2d225eC5D6Dd',
        splitter2: '0xd7dEB657216Dc50D2D09D37c4602e6CC60A6804f'
      }
    },
    ethereum: {
      url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 1,
      scanner: 'https://etherscan.io',
      opensea: 'https://opensea.io',
      accounts: [process.env.BLOCKCHAIN_ETHEREUM_PRIVATE_KEY],
      contracts: {
        nft: '',
        splitter1: '',
        splitter2: ''
      }
    },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: process.env.BLOCKCHAIN_CMC_KEY,
    gasPrice: 200
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.BLOCKCHAIN_SCANNER_KEY
  }
};
