document.addEventListener("DOMContentLoaded", function () {
  checkIfMetaMaskIsInstalled();
  updateUIState();
  setupTabNavigation();
});

function setupTabNavigation() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.getAttribute("data-tab");
      loadTabContent(tab);
    });
  });
}

let web3;
let contract;
let userAccount;
let isConnected = false;
let activeTab = "available";
let isAdmin = false;
const contractOwner = "0x8dC03105bA1A429fc962EbE37766B8601D70e0D6";

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

    statusDisplay.textContent = "Connected: " + formatAddress(userAccount);
    statusDisplay.className = "status-ok";

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
}

function updateUIState() {
  const offerForm = document.getElementById("offerForm");
  const withdrawButton = document.getElementById("withdrawButton");
  const balanceContainer = document.getElementById("balanceContainer");
  const adminTab = document.getElementById("admin-tab-button");

  if (isConnected) {
    offerForm.style.display = "block";
    withdrawButton.disabled = false;
    balanceContainer.style.display = "flex";

    // Show/hide admin tab based on user role
    if (isAdmin) {
      adminTab.style.display = "block";
    } else {
      adminTab.style.display = "none";
    }

    refreshBalance();
    loadTabContent(activeTab);
  } else {
    offerForm.style.display = "none";
    withdrawButton.disabled = true;
    balanceContainer.style.display = "none";
    adminTab.style.display = "none";
    document.getElementById("offers").innerHTML =
      "<p>Please connect your wallet to view offers</p>";
    document.getElementById("my-offers").innerHTML =
      "<p>Please connect your wallet to view your offers</p>";
    document.getElementById("bought-offers").innerHTML =
      "<p>Please connect your wallet to view your purchased offers</p>";
    document.getElementById("sold-offers").innerHTML =
      "<p>Please connect your wallet to view your sold offers</p>";
    document.getElementById("all-offers").innerHTML =
      "<p>Please connect your wallet as admin to view all offers</p>";
  }
}

async function refreshBalance() {
  if (!isConnected) return;

  try {
    const balance = await contract.methods
      .getMyBalance()
      .call({ from: userAccount });
    const balanceInEth = web3.utils.fromWei(balance.toString(), "ether");
    document.getElementById("userBalance").textContent = balanceInEth;
  } catch (error) {
    console.error("Error fetching balance:", error);
    document.getElementById("userBalance").textContent = "Error";
  }
}

async function loadOffers() {
  if (!isConnected) return;

  const offersContainer = document.getElementById("offers");
  offersContainer.innerHTML = "<p>Loading offers...</p>";

  try {
    const offerIds = await contract.methods.getAvailableOffers().call();

    if (offerIds.length === 0) {
      offersContainer.innerHTML = "<p>No active offers available</p>";
      return;
    }

    let html = "";
    for (let id of offerIds) {
      const offer = await contract.methods.getOffer(id).call();
      const totalPrice = web3.utils
        .toBN(offer.energyAmount)
        .mul(web3.utils.toBN(offer.pricePerUnit));
      const formattedPrice = web3.utils.fromWei(totalPrice.toString(), "ether");
      const pricePerUnitEth = web3.utils.fromWei(
        offer.pricePerUnit.toString(),
        "ether"
      );

      html += `
        <div class="offer">
          <div class="offer-header">
            <span class="offer-id">Offer #${offer.id}</span>
            <span class="offer-status active">Active</span>
          </div>
          <div class="offer-details">
            <p>Seller: ${formatAddress(offer.seller)}</p>
            <p>Energy Amount: ${offer.energyAmount} kWh</p>
            <p>Price per kWh: ${pricePerUnitEth} ETH</p>
            <p>Total Price: ${formattedPrice} ETH</p>
          </div>
          <button class="buy-button" onclick="buyEnergy(${
            offer.id
          }, '${totalPrice}')">Buy Now</button>
        </div>
      `;
    }

    offersContainer.innerHTML = html;
  } catch (error) {
    console.error("Error loading offers:", error);
    offersContainer.innerHTML = `<p>Error loading offers: ${error.message}</p>`;
  }
}

async function loadMyOffers() {
  if (!isConnected) return;

  const myOffersContainer = document.getElementById("my-offers");
  myOffersContainer.innerHTML = "<p>Loading your offers...</p>";

  try {
    const offerIds = await contract.methods
      .getMyOffers()
      .call({ from: userAccount });

    if (offerIds.length === 0) {
      myOffersContainer.innerHTML = "<p>You haven't created any offers yet</p>";
      return;
    }

    let html = "";
    for (let id of offerIds) {
      const offer = await contract.methods.getOffer(id).call();
      const totalPrice = web3.utils
        .toBN(offer.energyAmount)
        .mul(web3.utils.toBN(offer.pricePerUnit));
      const formattedPrice = web3.utils.fromWei(totalPrice.toString(), "ether");
      const pricePerUnitEth = web3.utils.fromWei(
        offer.pricePerUnit.toString(),
        "ether"
      );

      let statusClass = offer.isActive ? "active" : "inactive";
      let statusText = offer.isActive
        ? "Active"
        : offer.isSold
        ? "Sold"
        : "Cancelled";

      html += `
        <div class="offer">
          <div class="offer-header">
            <span class="offer-id">Offer #${offer.id}</span>
            <span class="offer-status ${statusClass}">${statusText}</span>
          </div>
          <div class="offer-details">
            <p>Energy Amount: ${offer.energyAmount} kWh</p>
            <p>Price per kWh: ${pricePerUnitEth} ETH</p>
            <p>Total Price: ${formattedPrice} ETH</p>
            ${offer.isSold ? `<p>Buyer: ${formatAddress(offer.buyer)}</p>` : ""}
          </div>
          ${
            offer.isActive
              ? `<button class="cancel-button" onclick="cancelOffer(${offer.id})">Cancel Offer</button>`
              : ""
          }
        </div>
      `;
    }

    myOffersContainer.innerHTML = html;
  } catch (error) {
    console.error("Error loading your offers:", error);
    myOffersContainer.innerHTML = `<p>Error loading your offers: ${error.message}</p>`;
  }
}

async function loadBoughtOffers() {
  if (!isConnected) return;

  const boughtOffersContainer = document.getElementById("bought-offers");
  boughtOffersContainer.innerHTML = "<p>Loading your purchased offers...</p>";

  try {
    const offerIds = await contract.methods
      .getMyBoughtOffers()
      .call({ from: userAccount });

    if (offerIds.length === 0) {
      boughtOffersContainer.innerHTML =
        "<p>You haven't purchased any offers yet</p>";
      return;
    }

    let html = "";
    for (let id of offerIds) {
      const offer = await contract.methods.getOffer(id).call();
      const totalPrice = web3.utils
        .toBN(offer.energyAmount)
        .mul(web3.utils.toBN(offer.pricePerUnit));
      const formattedPrice = web3.utils.fromWei(totalPrice.toString(), "ether");
      const pricePerUnitEth = web3.utils.fromWei(
        offer.pricePerUnit.toString(),
        "ether"
      );

      html += `
        <div class="offer">
          <div class="offer-header">
            <span class="offer-id">Offer #${offer.id}</span>
            <span class="offer-status inactive">Purchased</span>
          </div>
          <div class="offer-details">
            <p>Seller: ${formatAddress(offer.seller)}</p>
            <p>Energy Amount: ${offer.energyAmount} kWh</p>
            <p>Price per kWh: ${pricePerUnitEth} ETH</p>
            <p>Total Price: ${formattedPrice} ETH</p>
          </div>
        </div>
      `;
    }

    boughtOffersContainer.innerHTML = html;
  } catch (error) {
    console.error("Error loading your purchased offers:", error);
    boughtOffersContainer.innerHTML = `<p>Error loading your purchased offers: ${error.message}</p>`;
  }
}

async function loadSoldOffers() {
  if (!isConnected) return;

  const soldOffersContainer = document.getElementById("sold-offers");
  soldOffersContainer.innerHTML = "<p>Loading your sold offers...</p>";

  try {
    const offerIds = await contract.methods
      .getMySoldOffers()
      .call({ from: userAccount });

    if (offerIds.length === 0) {
      soldOffersContainer.innerHTML = "<p>You haven't sold any offers yet</p>";
      return;
    }

    let html = "";
    for (let id of offerIds) {
      const offer = await contract.methods.getOffer(id).call();
      const totalPrice = web3.utils
        .toBN(offer.energyAmount)
        .mul(web3.utils.toBN(offer.pricePerUnit));
      const formattedPrice = web3.utils.fromWei(totalPrice.toString(), "ether");
      const pricePerUnitEth = web3.utils.fromWei(
        offer.pricePerUnit.toString(),
        "ether"
      );

      html += `
        <div class="offer">
          <div class="offer-header">
            <span class="offer-id">Offer #${offer.id}</span>
            <span class="offer-status inactive">Sold</span>
          </div>
          <div class="offer-details">
            <p>Buyer: ${formatAddress(offer.buyer)}</p>
            <p>Energy Amount: ${offer.energyAmount} kWh</p>
            <p>Price per kWh: ${pricePerUnitEth} ETH</p>
            <p>Total Price: ${formattedPrice} ETH</p>
          </div>
        </div>
      `;
    }

    soldOffersContainer.innerHTML = html;
  } catch (error) {
    console.error("Error loading your sold offers:", error);
    soldOffersContainer.innerHTML = `<p>Error loading your sold offers: ${error.message}</p>`;
  }
}

async function loadAllOffers() {
  if (!isConnected || !isAdmin) return;

  const allOffersContainer = document.getElementById("all-offers");
  allOffersContainer.innerHTML = "<p>Loading all offers...</p>";

  try {
    const offerIds = await contract.methods
      .getAllOffers()
      .call({ from: userAccount });

    if (offerIds.length === 0) {
      allOffersContainer.innerHTML = "<p>No offers exist in the system</p>";
      return;
    }

    let html = "";
    for (let id of offerIds) {
      const offer = await contract.methods.getOffer(id).call();
      const totalPrice = web3.utils
        .toBN(offer.energyAmount)
        .mul(web3.utils.toBN(offer.pricePerUnit));
      const formattedPrice = web3.utils.fromWei(totalPrice.toString(), "ether");
      const pricePerUnitEth = web3.utils.fromWei(
        offer.pricePerUnit.toString(),
        "ether"
      );

      let statusClass = offer.isActive ? "active" : "inactive";
      let statusText = offer.isActive
        ? "Active"
        : offer.isSold
        ? "Sold"
        : "Cancelled";

      html += `
        <div class="offer">
          <div class="offer-header">
            <span class="offer-id">Offer #${offer.id}</span>
            <span class="offer-status ${statusClass}">${statusText}</span>
          </div>
          <div class="offer-details">
            <p>Seller: ${formatAddress(offer.seller)}</p>
            <p>Energy Amount: ${offer.energyAmount} kWh</p>
            <p>Price per kWh: ${pricePerUnitEth} ETH</p>
            <p>Total Price: ${formattedPrice} ETH</p>
            ${offer.isSold ? `<p>Buyer: ${formatAddress(offer.buyer)}</p>` : ""}
          </div>
        </div>
      `;
    }

    allOffersContainer.innerHTML = html;
  } catch (error) {
    console.error("Error loading all offers:", error);
    allOffersContainer.innerHTML = `<p>Error loading all offers: ${error.message}</p>`;
  }
}

function loadTabContent(tab) {
  activeTab = tab;

  // Update active tab button
  document.querySelectorAll(".tab-button").forEach((button) => {
    if (button.getAttribute("data-tab") === tab) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  // Show active tab content, hide others
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  let tabContentId;
  switch (tab) {
    case "available":
      tabContentId = "available-tab";
      loadOffers();
      break;
    case "my-offers":
      tabContentId = "my-offers-tab";
      loadMyOffers();
      break;
    case "bought":
      tabContentId = "bought-tab";
      loadBoughtOffers();
      break;
    case "sold":
      tabContentId = "sold-tab";
      loadSoldOffers();
      break;
    case "admin":
      tabContentId = "admin-tab";
      loadAllOffers();
      break;
    default:
      console.error("Invalid tab:", tab);
      return;
  }

  document.getElementById(tabContentId).classList.add("active");
}

async function addOffer() {
  if (!isConnected) return;

  const energyAmount = document.getElementById("energyAmount").value;
  const pricePerUnit = web3.utils.toWei(
    document.getElementById("pricePerUnit").value,
    "ether"
  );

  if (!energyAmount || !pricePerUnit) {
    alert("Please fill in all fields");
    return;
  }

  const statusDisplay = document.getElementById("statusDisplay");
  statusDisplay.textContent = "Adding offer...";

  try {
    await contract.methods
      .addOffer(energyAmount, pricePerUnit)
      .send({ from: userAccount });

    statusDisplay.textContent = "Offer added successfully!";
    document.getElementById("energyAmount").value = "";
    document.getElementById("pricePerUnit").value = "";
    loadTabContent(activeTab);
  } catch (error) {
    console.error("Error adding offer:", error);
    statusDisplay.textContent = `Error adding offer: ${error.message}`;
  }
}

async function buyEnergy(offerId, totalPrice) {
  if (!isConnected) return;

  const statusDisplay = document.getElementById("statusDisplay");
  statusDisplay.textContent = "Buying energy...";

  try {
    await contract.methods
      .buyEnergy(offerId)
      .send({ from: userAccount, value: totalPrice });

    statusDisplay.textContent = "Energy purchased successfully!";
    refreshBalance();
    loadTabContent(activeTab);
  } catch (error) {
    console.error("Error buying energy:", error);
    statusDisplay.textContent = `Error buying energy: ${error.message}`;
  }
}

async function cancelOffer(offerId) {
  if (!isConnected) return;

  const statusDisplay = document.getElementById("statusDisplay");
  statusDisplay.textContent = "Cancelling offer...";

  try {
    await contract.methods.cancelOffer(offerId).send({ from: userAccount });

    statusDisplay.textContent = "Offer cancelled successfully!";
    loadTabContent(activeTab);
  } catch (error) {
    console.error("Error cancelling offer:", error);
    statusDisplay.textContent = `Error cancelling offer: ${error.message}`;
  }
}

async function withdrawFunds() {
  if (!isConnected) return;

  const statusDisplay = document.getElementById("statusDisplay");
  statusDisplay.textContent = "Withdrawing funds...";

  try {
    await contract.methods.withdrawFunds().send({ from: userAccount });

    statusDisplay.textContent = "Funds withdrawn successfully!";
    refreshBalance();
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    statusDisplay.textContent = `Error withdrawing funds: ${error.message}`;
  }
}

function formatAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}
