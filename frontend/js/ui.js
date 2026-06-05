import { isConnected, isAdmin } from "./wallet.js";
import {
  loadOffers,
  loadMyOffers,
  loadBoughtOffers,
  loadSoldOffers,
  loadAllOffers,
  refreshBalance,
} from "./offers.js";

let activeTab = "available";

function setupTabNavigation() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.getAttribute("data-tab");
      loadTabContent(tab);
    });
  });
}

function updateUIState() {
  const offerForm = document.getElementById("offerForm");
  const withdrawButton = document.getElementById("withdrawButton");
  const balanceContainer = document.getElementById("balanceContainer");
  const adminTab = document.getElementById("admin-tab-button");
  const adminControls = document.getElementById("admin-controls");

  if (isConnected) {
    offerForm.style.display = "block";
    withdrawButton.disabled = false;
    balanceContainer.style.display = "flex";
    adminTab.style.display = "block";
    if (adminControls) {
      if (isAdmin) {
        adminControls.style.display = "block";
      } else {
        adminControls.style.display = "none";
      }
    }

    refreshBalance();
    loadTabContent(activeTab);
  } else {
    offerForm.style.display = "none";
    withdrawButton.disabled = true;
    balanceContainer.style.display = "none";
    adminTab.style.display = "none";
    if (adminControls) adminControls.style.display = "none";

    document.getElementById("offers").innerHTML =
      "<p>Please connect your wallet to view offers</p>";
    document.getElementById("my-offers").innerHTML =
      "<p>Please connect your wallet to view your offers</p>";
    document.getElementById("bought-offers").innerHTML =
      "<p>Please connect your wallet to view your purchased offers</p>";
    document.getElementById("sold-offers").innerHTML =
      "<p>Please connect your wallet to view your sold offers</p>";
    document.getElementById("all-offers").innerHTML =
      "<p>Please connect your wallet to view all offers</p>";
  }
}

function loadTabContent(tab) {
  activeTab = tab;

  document.querySelectorAll(".tab-button").forEach((button) => {
    if (button.getAttribute("data-tab") === tab) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

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

export { activeTab, setupTabNavigation, updateUIState, loadTabContent };
