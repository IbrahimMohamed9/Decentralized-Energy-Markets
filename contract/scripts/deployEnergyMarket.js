//npx hardhat run scripts\deployEnergyMarket.js --network sepolia
// 0x002269Cf98F9838a45946738167CDb7eaeE5e9b2

// https://sepolia.etherscan.io/address/0x002269Cf98F9838a45946738167CDb7eaeE5e9b2
const { ethers } = require("hardhat");

async function main() {
  const EnergyMarket = await ethers.getContractFactory("EnergyMarket");
  console.log("Deploying EnergyMarket...");
  const contract = await EnergyMarket.deploy();
  await contract.waitForDeployment();

  console.log("EnergyMarket address: ", contract.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
