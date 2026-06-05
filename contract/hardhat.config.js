require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");

const { vars } = require("hardhat/config");
const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");
// eaHXlITPeC6w-eYP9vndKCMW_sCLSE31
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");
// 53b76585abd0db8fa09cca3b7fd3a1fd9d7eda8119d7e19b818819e3c7e11da9
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
// KS5UZGMQIRJN8NI5PXAEVPCW5R4UXXP49Y

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.30",
    settings: {
      optimizer: {
        enabled: true,
        runs: 50,
      },
    },
  },
  networks: {
    // network info setup
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  // settings: {
  //   remappings: [
  //     "@account-abstraction/=node_modules/@account-abstraction/"
  //   ]
  // }
};
