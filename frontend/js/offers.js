import {
  web3,
  contract,
  userAccount,
  isConnected,
  isAdmin,
  formatAddress,
} from "./wallet.js";

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
      const totalPrice =
        BigInt(offer.energyAmount) * BigInt(offer.pricePerUnit);
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
    offersContainer.innerHTML = `<p class="error">Error loading offers: ${error.message}</p>`;
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
      const totalPrice =
        BigInt(offer.energyAmount) * BigInt(offer.pricePerUnit);
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
    myOffersContainer.innerHTML = `<p class="error">Error loading your offers: ${error.message}</p>`;
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
      const totalPrice =
        BigInt(offer.energyAmount) * BigInt(offer.pricePerUnit);
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
    boughtOffersContainer.innerHTML = `<p class="error">Error loading your purchased offers: ${error.message}</p>`;
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
      const totalPrice =
        BigInt(offer.energyAmount) * BigInt(offer.pricePerUnit);
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
    soldOffersContainer.innerHTML = `<p class="error">Error loading your sold offers: ${error.message}</p>`;
  }
}

async function loadAllOffers() {
  if (!isConnected) return;

  const allOffersContainer = document.getElementById("all-offers");
  allOffersContainer.innerHTML = "<p>Loading all offers...</p>";

  try {
    const offerIds = await contract.methods.getAllOffers().call();

    if (offerIds.length === 0) {
      allOffersContainer.innerHTML = "<p>No offers found</p>";
      return;
    }

    let html = "";
    for (let id of offerIds) {
      const offer = await contract.methods.getOffer(id).call();
      const totalPrice =
        BigInt(offer.energyAmount) * BigInt(offer.pricePerUnit);
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
    allOffersContainer.innerHTML = `<p class="error">Error loading all offers: ${error.message}</p>`;
  }
}

async function addOffer() {
  if (!isConnected) return;

  const energyAmount = document.getElementById("energyAmount").value;
  const pricePerUnit = web3.utils.toWei(
    document.getElementById("pricePerUnit").value,
    "ether"
  );

  if (!energyAmount || !pricePerUnit) {
    alert("⚡ Please fill in all fields to power up your offer! ⚡");
    return;
  }

  const statusDisplay = document.getElementById("statusDisplay");
  statusDisplay.textContent = "Adding your energy to the grid...";
  statusDisplay.className = "status-pending";

  try {
    await contract.methods
      .addOffer(energyAmount, pricePerUnit)
      .send({ from: userAccount });

    statusDisplay.textContent =
      "⚡ Your energy is now on the market! Electrifying! ⚡";
    statusDisplay.className = "status-ok";
    document.getElementById("energyAmount").value = "";
    document.getElementById("pricePerUnit").value = "";
    loadOffers();
  } catch (error) {
    console.error("Error adding offer:", error);

    let errorMessage = "";

    if (error.message.includes("reverted")) {
      errorMessage =
        "⚠️ Energy offer rejected! The grid is being picky today. ⚠️";
    } else if (error.message.includes("user denied")) {
      errorMessage =
        "🛑 You pulled the plug on your energy listing! Transaction cancelled. 🛑";
    } else {
      errorMessage =
        "⚠️ Your energy couldn't be added to the market! The grid experienced a power surge. ⚠️";
    }

    statusDisplay.textContent = errorMessage;
    statusDisplay.className = "status-error";
  }
}

async function buyEnergy(offerId, totalPrice) {
  if (!isConnected) return;

  const statusDisplay = document.getElementById("statusDisplay");
  statusDisplay.textContent = "Buying energy...";
  statusDisplay.className = "status-pending";

  try {
    await contract.methods
      .buyEnergy(offerId)
      .send({ from: userAccount, value: totalPrice });

    statusDisplay.textContent =
      "⚡ Energy purchased successfully! Power up! ⚡";
    statusDisplay.className = "status-ok";
    refreshBalance();
    loadOffers();
  } catch (error) {
    console.error("Error buying energy:", error);

    let errorMessage;
    if (error.message.includes("reverted")) {
      errorMessage =
        "⚠️ Energy transaction failed! The blockchain grid rejected your request. ⚠️";
    } else if (error.message.includes("insufficient funds")) {
      errorMessage =
        "💸 Your wallet's power level is too low! Need more ETH to fuel this purchase. 💸";
    } else if (error.message.includes("user denied")) {
      errorMessage =
        "🛑 Transaction unplugged! You pulled the power cord on this purchase. 🛑";
    } else {
      errorMessage =
        "⚠️ Energy purchase failed! The grid experienced technical difficulties. ⚠️";
    }

    statusDisplay.textContent = errorMessage;
    statusDisplay.className = "status-error";
  }
}

async function cancelOffer(offerId) {
  if (!isConnected) return;

  const statusDisplay = document.getElementById("statusDisplay");
  statusDisplay.textContent = "Unplugging your energy offer...";
  statusDisplay.className = "status-pending";

  try {
    await contract.methods.cancelOffer(offerId).send({ from: userAccount });

    statusDisplay.textContent = "📴 Energy offer unplugged from the grid! 📴";
    statusDisplay.className = "status-ok";
    loadOffers();
  } catch (error) {
    console.error("Error cancelling offer:", error);

    let errorMessage = "";

    if (error.message.includes("reverted")) {
      errorMessage =
        "⚠️ Can't unplug this energy offer! The grid won't let go. ⚠️";
    } else if (error.message.includes("user denied")) {
      errorMessage =
        "🛑 You changed your mind about changing your mind! Cancellation aborted. 🛑";
    } else {
      errorMessage =
        "⚠️ Couldn't cancel your energy offer! The blockchain is experiencing resistance. ⚠️";
    }

    statusDisplay.textContent = errorMessage;
    statusDisplay.className = "status-error";
  }
}

async function withdrawFunds() {
  if (!isConnected) return;

  const statusDisplay = document.getElementById("statusDisplay");
  statusDisplay.textContent = "Harvesting your energy profits...";
  statusDisplay.className = "status-pending";

  try {
    await contract.methods.withdrawFunds().send({ from: userAccount });

    statusDisplay.textContent =
      "💰 Energy profits successfully transferred to your wallet! 💰";
    statusDisplay.className = "status-ok";
    refreshBalance();
  } catch (error) {
    console.error("Error withdrawing funds:", error);

    let errorMessage = "";

    if (error.message.includes("reverted")) {
      errorMessage =
        "⚠️ Your energy profits are stuck in the grid! Withdrawal failed. ⚠️";
    } else if (
      error.message.includes(
        "The blockchain vault won't open! Your funds remain locked in the contract. ⚠️"
      )
    ) {
      errorMessage =
        "⚠️ The blockchain vault won't open! Your funds remain locked in the contract. ⚠️";
    } else if (error.message.includes("user denied")) {
      errorMessage =
        "🛑 You cancelled the withdrawal! Your energy profits remain in the grid. 🛑";
    } else if (
      error.message.includes("balance") ||
      error.message.includes("nothing")
    ) {
      errorMessage =
        "💸 No energy profits to harvest! Your balance meter reads zero. 💸";
    } else {
      errorMessage =
        "⚠️ Couldn't collect your energy profits! The blockchain ledger experienced a power surge. ⚠️";
    }

    statusDisplay.textContent = errorMessage;
    statusDisplay.className = "status-error";
  }
}

async function pauseMarket() {
  if (!isConnected || !isAdmin) return;

  const statusDisplay = document.getElementById("statusDisplay");
  statusDisplay.textContent = "Pausing the energy market...";
  statusDisplay.className = "status-pending";

  try {
    await contract.methods.pauseMarket().send({ from: userAccount });

    statusDisplay.textContent = "⚠️ Energy market has been paused! ⚠️";
    statusDisplay.className = "status-warning";
    loadAllOffers(); // Refresh the admin view
  } catch (error) {
    console.error("Error pausing market:", error);

    let errorMessage = "";

    if (error.message.includes("reverted")) {
      errorMessage = "⚠️ Market is already paused! ⚠️";
    } else if (error.message.includes("user denied")) {
      errorMessage = "🛑 You cancelled the market pause operation! 🛑";
    } else {
      errorMessage = "⚠️ Couldn't pause the market! An error occurred. ⚠️";
    }

    statusDisplay.textContent = errorMessage;
    statusDisplay.className = "status-error";
  }
}

async function resumeMarket() {
  if (!isConnected || !isAdmin) return;

  const statusDisplay = document.getElementById("statusDisplay");
  statusDisplay.textContent = "Resuming the energy market...";
  statusDisplay.className = "status-pending";

  try {
    await contract.methods.resumeMarket().send({ from: userAccount });

    statusDisplay.textContent = "✅ Energy market has been resumed! Trading can continue. ✅";
    statusDisplay.className = "status-ok";
    loadAllOffers(); // Refresh the admin view
  } catch (error) {
    console.error("Error resuming market:", error);

    let errorMessage = "";

    if (error.message.includes("reverted")) {
      errorMessage = "⚠️ Market is already active! ⚠️";
    } else if (error.message.includes("user denied")) {
      errorMessage = "🛑 You cancelled the market resume operation! 🛑";
    } else {
      errorMessage = "⚠️ Couldn't resume the market! An error occurred. ⚠️";
    }

    statusDisplay.textContent = errorMessage;
    statusDisplay.className = "status-error";
  }
}

export {
  refreshBalance,
  loadOffers,
  loadMyOffers,
  loadBoughtOffers,
  loadSoldOffers,
  loadAllOffers,
  addOffer,
  buyEnergy,
  cancelOffer,
  withdrawFunds,
  pauseMarket,
  resumeMarket,
};
