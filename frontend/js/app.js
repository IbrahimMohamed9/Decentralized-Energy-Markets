import * as wallet from "./wallet.js";
import * as ui from "./ui.js";
import * as offers from "./offers.js";

document.addEventListener("DOMContentLoaded", function () {
  wallet.setUpdateUIState(ui.updateUIState);
  wallet.checkIfMetaMaskIsInstalled();
  ui.setupTabNavigation();
  ui.updateUIState();
  window.connectWallet = wallet.connectWallet;
  window.addOffer = offers.addOffer;
  window.buyEnergy = offers.buyEnergy;
  window.cancelOffer = offers.cancelOffer;
  window.withdrawFunds = offers.withdrawFunds;
  window.pauseMarket = offers.pauseMarket;
  window.resumeMarket = offers.resumeMarket;
  window.refreshBalance = offers.refreshBalance;
});
