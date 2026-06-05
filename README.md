# Decentralized Energy Market

A blockchain-based platform for buying and selling renewable energy directly on the Ethereum blockchain. This project enables peer-to-peer energy trading without intermediaries, allowing energy producers and consumers to transact directly with each other using smart contracts.

## 🎯 Project Overview

The Decentralized Energy Market is built on Ethereum and combines smart contracts with a web-based frontend to create a transparent, trustless marketplace for energy. Users can:

- **Create Energy Offers**: Producers can list renewable energy for sale
- **Purchase Energy**: Consumers can browse and buy energy directly from producers
- **Track Transactions**: All transactions are recorded on the blockchain
- **Manage Balances**: Withdraw funds earned from energy sales

## 🏗️ Project Structure

```
Decentralized Energy Markets/
├── contract/                    # Smart contract & Hardhat configuration
│   ├── contracts/
│   │   └── EnergyMarket.sol    # Main smart contract
│   ├── scripts/
│   │   └── deployEnergyMarket.js # Deployment script
│   ├── ignition/
│   │   └── modules/            # Hardhat Ignition deployment modules
│   ├── artifacts/              # Compiled contract artifacts
│   ├── hardhat.config.js       # Hardhat configuration
│   └── package.json            # Project dependencies
│
└── frontend/                    # Web UI
    ├── index.html              # Main HTML file
    ├── app.css                 # Styles
    ├── app.js                  # Main application entry point
    ├── constants.js            # Configuration constants
    └── js/                     # JavaScript modules
        ├── app.js              # App logic
        ├── wallet.js           # Wallet connection
        ├── contract.js         # Contract interactions
        ├── offers.js           # Offer management
        ├── ui.js               # UI utilities
        └── config.js           # Configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension (for interacting with the frontend)

### Installation

1. **Clone the repository** (if using version control)

   ```bash
   git clone <repository-url>
   cd "Decentralized Energy Markets"
   ```

2. **Install backend dependencies**

   ```bash
   cd contract
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the `contract/` directory:
   ```
   SEPOLIA_PRIVATE_KEY=your_private_key_here
   ALCHEMY_API_KEY=your_alchemy_api_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

### Compile Smart Contract

```bash
cd contract
npx hardhat compile
```

### Deploy Smart Contract

**To Sepolia Testnet:**

```bash
npx hardhat run scripts/deployEnergyMarket.js --network sepolia
```

Save the deployed contract address for the frontend configuration.

### Running the Frontend

1. Navigate to the `frontend/` directory
2. Update the contract address in your configuration files if needed
3. Open `index.html` in a web browser or use a local server:

   ```bash
   # Using Python 3
   python -m http.server 3000

   # Or using Node.js
   npx http-server -p 3000
   ```

4. Connect MetaMask wallet and start trading energy!

## 📋 Smart Contract Features

### Core Functions

- **`addOffer(uint energyAmount, uint pricePerUnit)`** - Create a new energy offer
- **`buyEnergy(uint offerId)`** - Purchase energy from an offer
- **`cancelOffer(uint offerId)`** - Cancel an active offer
- **`withdrawFunds(uint amount)`** - Withdraw earnings from sales
- **`toggleMarketStatus()`** - Pause/resume market (owner only)

### Data Structures

**EnergyOffer**

- `id`: Unique offer identifier
- `seller`: Address of the energy producer
- `energyAmount`: Amount of energy available (in units)
- `pricePerUnit`: Price per unit of energy
- `isActive`: Whether the offer is currently available
- `isSold`: Whether the offer has been fully purchased
- `buyer`: Address of the buyer (if sold)

## 💻 Technology Stack

### Backend (Smart Contract)

- **Solidity** 0.8.30
- **Hardhat** - Development environment
- **OpenZeppelin Contracts** - Secure contract libraries

### Frontend

- **HTML5** - Structure
- **CSS3** - Styling
- **JavaScript (ES6+)** - Application logic
- **Web3.js** - Ethereum blockchain interaction
- **MetaMask** - Wallet integration

### Network

- **Sepolia Testnet** (Primary deployment)
- Ethereum mainnet (production ready)

## 🔒 Security Considerations

- Smart contract uses modifiers to enforce access control
- Only the contract owner can pause/resume the market
- Only sellers can cancel their own offers
- Funds are securely managed with balance tracking
- All transactions are recorded immutably on the blockchain

## 📱 Usage Guide

### For Energy Sellers

1. Connect your MetaMask wallet
2. Click "Create Energy Offer"
3. Enter energy amount and price per unit
4. Confirm the transaction
5. View your listed offers in the dashboard
6. Withdraw funds after sales

### For Energy Buyers

1. Connect your MetaMask wallet
2. Browse available energy offers
3. Click "Buy" on desired offer
4. Approve the payment in MetaMask
5. Confirm the purchase transaction
6. View purchased energy in your history

## 🧪 Testing

Deploy to Sepolia testnet for testing:

```bash
cd contract
npx hardhat test
npx hardhat run scripts/deployEnergyMarket.js --network sepolia
```

Get Sepolia ETH from a faucet:

- [Sepolia Faucet](https://sepoliafaucet.com)

## 📊 Smart Contract Deployment

**Current Deployment (Sepolia):**

- Contract Address: `0x002269Cf98F9838a45946738167CDb7eaeE5e9b2`

### Verify Contract on Etherscan

```bash
npx hardhat verify "0x002269Cf98F9838a45946738167CDb7eaeE5e9b2" --network sepolia
```

## 🛠️ Development

### Local Development Environment

```bash
# Start Hardhat local node
cd contract
npx hardhat node
```

### Compile Changes

```bash
NPX hardhat compile
```

### Monitor Gas Usage

```bash
REPORT_GAS=true npx hardhat test
```

## 🚨 Important Notes

- **Private Keys**: Never commit `.env` files or expose private keys in version control
- **Testnet Only**: Always test thoroughly on testnet before mainnet deployment
- **Gas Costs**: Be aware of gas fees when deployed to mainnet
- **Contract Upgrades**: Current contract is not upgradeable; plan carefully before deployment

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch
2. Make your changes
3. Test thoroughly on testnet
4. Submit a pull request

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository.

## 🔗 Useful Links

- [Hardhat Documentation](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Web3.js Documentation](https://docs.web3js.org/)
- [Ethereum Development](https://ethereum.org/en/developers/)
- [MetaMask Documentation](https://docs.metamask.io/)

---

**Built with ⚡ for a decentralized energy future**
