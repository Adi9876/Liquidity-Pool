# Decentralized Exchange (DEX) Frontend

A React-based frontend application for interacting with a decentralized exchange smart contract on the Sepolia testnet. This DEX allows users to swap between two ERC20 tokens and manage liquidity pools.

## Features

### Wallet Connection

- MetaMask integration for connecting to the Sepolia testnet
- Displays connected wallet address
- Automatic balance updates for connected accounts

### Token Management

- Displays balances for:
  - Token A (TKA)
  - Token B (TKB)
  - Pool Shares

### Liquidity Pool Operations

1. **Add Liquidity**
   - Input fields for Token A and Token B amounts
   - Approval process for token spending
   - Transaction confirmation feedback
   - Loading states during transaction processing

2. **Remove Liquidity**
   - Input field for shares amount
   - Removes liquidity proportionally
   - Returns both tokens to user's wallet
   - Transaction status feedback

### Token Swapping

- Swap Token A for Token B
- Swap Token B for Token A
- Real-time loading states during swaps
- Transaction confirmation feedback
- Error handling for insufficient balances

### Admin Features (Owner Only)

- Token minting capability for both Token A and Token B
- Specify recipient address and amount for minting
- Owner-only access control

## Contract Addresses (Sepolia)

## Technologies Used

- React.js
- ethers.js v6
- Tailwind CSS
- MetaMask Web3 Provider

## Setup and Installation

1. Clone the repository

    ```bash
    git clone https://github.com/your-repo/decentralized-exchange.git
    ```

2. Navigate to the frontend directory

    ```bash
    cd frontend
    ```

3. Install dependencies

    ```bash
    npm install
    ```

4. Start the development server

    ```bash
    npm run dev
    ```

5. Open your browser and navigate to `http://localhost:3000` to access the application.


## Usage Instructions

### Connecting Wallet

1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Ensure you're connected to Sepolia testnet

### Adding Liquidity

1. Enter amount for Token A
2. Enter amount for Token B
3. Click "Add Liquidity"
4. Approve token spending (two transactions)
5. Confirm the add liquidity transaction

### Removing Liquidity

1. Enter the number of shares to remove
2. Click "Remove Liquidity"
3. Confirm the transaction in MetaMask

### Swapping Tokens

1. Enter the amount to swap
2. Choose swap direction (A→B or B→A)
3. Approve token spending
4. Confirm the swap transaction

### Minting Tokens (Owner Only)

1. Connect with owner wallet
2. Select token to mint (A or B)
3. Enter recipient address
4. Enter amount to mint
5. Confirm the minting transaction

## Error Handling

The application handles various error scenarios:

- Insufficient balance
- Insufficient allowance
- Transaction rejections
- Network errors
- Invalid input values

## UI Features

- Loading indicators for transactions
- Real-time balance updates
- Responsive design
- Tab-based navigation between liquidity and swap functions
- Clear transaction feedback

## Development Notes

- Uses ethers.js v6 for Web3 interactions
- Implements proper decimal handling for token amounts
- Includes comprehensive error handling
- Features loading states for better UX
- Supports owner-only functions with proper access control

## Security Considerations

- Implements proper approval flow for token spending
- Validates input amounts and addresses
- Checks balances before transactions
- Handles failed transactions gracefully

## Known Issues

- Balance display might need refresh after transactions
- Loading states might persist if transaction fails silently
- MetaMask network switching might require page refresh

## Future Improvements

- Add price impact calculations
- Implement slippage tolerance
- Add transaction history
- Improve error messages
- Add token price charts
- Implement token search/selection