import { contractAddress, contractOwner } from "./config.js";
import { abi } from "./contract.js";

let updateUIState = () => console.log("updateUIState not yet initialized");

function setUpdateUIState(uiUpdateFunction) {
  updateUIState = uiUpdateFunction;
}

let web3;
let contract;
let userAccount;
let isConnected = false;
let isAdmin = false;

function checkIfMetaMaskIsInstalled() {
  const connectButton = document.getElementById("connectButton");
  const statusDisplay = document.getElementById("statusDisplay");

  if (window.ethereum) {
    statusDisplay.textContent =
      "MetaMask is installed! Click Connect to proceed.";
    statusDisplay.className = "status-ok";

    window.ethereum.on("accountsChanged", function (accounts) {
      if (accounts.length === 0) {
        handleDisconnect();
      } else {
        userAccount = accounts[0];
        updateUIState();
      }
    });

    window.ethereum.on("chainChanged", function () {
      window.location.reload();
    });
  } else {
    statusDisplay.textContent =
      "MetaMask is not installed. Please install MetaMask to use this DApp.";
    statusDisplay.className = "status-error";
    connectButton.disabled = true;
  }
}

async function connectWallet() {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed!");
    }

    const statusDisplay = document.getElementById("statusDisplay");
    statusDisplay.textContent = "Connecting...";

    web3 = new Web3(window.ethereum);
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your MetaMask wallet.");
    }

    userAccount = accounts[0];
    contract = new web3.eth.Contract(abi, contractAddress);
    isConnected = true;

    isAdmin = contractOwner.toLowerCase() === userAccount.toLowerCase();

    statusDisplay.textContent = "Connected: " + formatAddress(userAccount);
    statusDisplay.className = "status-ok";

    const connectButton = document.getElementById("connectButton");
    connectButton.style.display = "none";

    updateUIState();

    return true;
  } catch (error) {
    console.error("Connection error:", error);
    const statusDisplay = document.getElementById("statusDisplay");
    statusDisplay.textContent = "Error: " + error.message;
    statusDisplay.className = "status-error";
    return false;
  }
}

function handleDisconnect() {
  userAccount = null;
  isConnected = false;
  isAdmin = false;
  updateUIState();

  const statusDisplay = document.getElementById("statusDisplay");
  statusDisplay.textContent =
    "Wallet disconnected. Please connect again to continue.";
  statusDisplay.className = "status-warning";

  const connectButton = document.getElementById("connectButton");
  connectButton.style.display = "block";
}

function formatAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}

export {
  web3,
  contract,
  userAccount,
  isConnected,
  isAdmin,
  checkIfMetaMaskIsInstalled,
  connectWallet,
  handleDisconnect,
  formatAddress,
  setUpdateUIState,
};
