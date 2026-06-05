// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract EnergyMarket {
    struct EnergyOffer {
        uint id;
        address seller;
        uint energyAmount;
        uint pricePerUnit;
        bool isActive;
        bool isSold;
        address buyer;
    }

    uint private nextOfferId = 1;
    bool private marketActive = true;
    address private owner;

    mapping(uint => EnergyOffer) private offers;
    mapping(address => uint) private sellerBalances;

    mapping(address => uint[]) private userOffers;
    mapping(address => uint[]) private userBoughtOffers;
    mapping(address => uint[]) private userSoldOffers;

    event OfferAdded(uint offerId, address seller, uint energyAmount, uint pricePerUnit);
    event EnergySold(uint offerId, address seller, address buyer, uint energyAmount, uint totalPrice);
    event OfferCancelled(uint offerId);
    event FundsWithdrawn(address seller, uint amount);
    event MarketStatusChanged(bool isActive);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier marketIsActive() {
        require(marketActive, "Market is currently paused");
        _;
    }

    modifier onlySeller(uint offerId) {
        require(offers[offerId].seller == msg.sender, "Only the seller can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addOffer(uint energyAmount, uint pricePerUnit) external marketIsActive returns (uint) {
        require(energyAmount > 0, "Energy amount must be greater than zero");

        uint offerId = nextOfferId;
        offers[offerId] = EnergyOffer({
            id: offerId,
            seller: msg.sender,
            energyAmount: energyAmount,
            pricePerUnit: pricePerUnit,
            isActive: true,
            isSold: false,
            buyer: address(0)
        });

        userOffers[msg.sender].push(offerId);

        nextOfferId++;

        emit OfferAdded(offerId, msg.sender, energyAmount, pricePerUnit);
        return offerId;
    }

    function buyEnergy(uint offerId) external payable marketIsActive {
        EnergyOffer storage offer = offers[offerId];

        require(offer.isActive, "Offer is not active");
        require(!offer.isSold, "Offer has already been sold");
        require(msg.sender != offer.seller, "Seller cannot buy their own offer");

        uint totalPrice = offer.energyAmount * offer.pricePerUnit;
        require(msg.value >= totalPrice, "Insufficient funds sent");

        offer.isActive = false;
        offer.isSold = true;
        offer.buyer = msg.sender;

        sellerBalances[offer.seller] += totalPrice;

        userBoughtOffers[msg.sender].push(offerId);
        userSoldOffers[offer.seller].push(offerId);

        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit EnergySold(offerId, offer.seller, msg.sender, offer.energyAmount, totalPrice);
    }

    function cancelOffer(uint offerId) external onlySeller(offerId) {
        EnergyOffer storage offer = offers[offerId];

        require(offer.isActive, "Offer is not active");
        require(!offer.isSold, "Offer has already been sold");

        offer.isActive = false;

        emit OfferCancelled(offerId);
    }

    function getAvailableOffers() external view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 1; i < nextOfferId; i++) {
            if (offers[i].isActive && !offers[i].isSold) {
                count++;
            }
        }

        uint[] memory activeOfferIds = new uint[](count);
        uint index = 0;
        for (uint i = 1; i < nextOfferId; i++) {
            if (offers[i].isActive && !offers[i].isSold) {
                activeOfferIds[index] = i;
                index++;
            }
        }

        return activeOfferIds;
    }

    function getOffer(uint offerId) external view returns (
        uint id,
        address seller,
        uint energyAmount,
        uint pricePerUnit,
        bool isActive,
        bool isSold,
        address buyer
    ) {
        EnergyOffer storage offer = offers[offerId];
        return (
            offer.id,
            offer.seller,
            offer.energyAmount,
            offer.pricePerUnit,
            offer.isActive,
            offer.isSold,
            offer.buyer
        );
    }

    function withdrawFunds() external {
        uint amount = sellerBalances[msg.sender];
        require(amount > 0, "No funds available to withdraw");

        sellerBalances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit FundsWithdrawn(msg.sender, amount);
    }

    function pauseMarket() external onlyOwner {
        require(marketActive, "Market is already paused");
        marketActive = false;
        emit MarketStatusChanged(false);
    }

    function resumeMarket() external onlyOwner {
        require(!marketActive, "Market is already active");
        marketActive = true;
        emit MarketStatusChanged(true);
    }

    function getMyBalance() external view returns (uint) {
        return sellerBalances[msg.sender];
    }

    function getAllOffers() external view returns (uint[] memory) {
        uint[] memory allOfferIds = new uint[](nextOfferId - 1);
        for (uint i = 1; i < nextOfferId; i++) {
            allOfferIds[i-1] = i;
        }
        return allOfferIds;
    }

    function getMyOffers() external view returns (uint[] memory) {
        return userOffers[msg.sender];
    }

    function getMyBoughtOffers() external view returns (uint[] memory) {
        return userBoughtOffers[msg.sender];
    }

    function getMySoldOffers() external view returns (uint[] memory) {
        return userSoldOffers[msg.sender];
    }
}
