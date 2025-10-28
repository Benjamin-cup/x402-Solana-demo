# x402 Solana Demo

A demonstration of HTTP 402 (Payment Required) using the x402 protocol on Solana. This project showcases a seller-buyer workflow where API endpoints require micropayments in USDC.

## Overview

This demo consists of two components:
- **Seller**: An Express server that exposes a paid API endpoint (`/weather`) protected by payment middleware
- **Buyer**: A client that makes requests to the paid endpoint with automatic payment handling

## Prerequisites

Before running this demo, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **Yarn** package manager (v1.22.22 or higher)
- **TypeScript** knowledge for understanding the codebase

You'll also need:
- A Solana mainnet wallet with USDC for testing
- The wallet's private key in base58 format

## Setting Up Environment

1. Clone the repository:
```bash
git clone https://github.com/Benjamin-cup/x402-Solana-demo.git
cd x402-Solana-demo
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file by copying the example:
```bash
cp .env.example .env
```

4. Configure your `.env` file with the following variables:

```env
FACILITATOR_URL=https://facilitator.payai.network
NETWORK=solana
SELLER_ADDRESS=<your-seller-wallet-address>
BUYER_PRIVATE_KEY=<your-buyer-wallet-private-key-in-base58>
```

**Important Notes:**
- The `BUYER_PRIVATE_KEY` should be the private key of a Solana wallet that has sufficient USDC balance
- The `SELLER_ADDRESS` in the `.env` file is for reference (the actual receiving address is configured in [src/seller.ts:12](src/seller.ts#L12))
- Ensure your buyer wallet has enough USDC to pay for API requests (currently set to $0.01 per request)

5. Build the TypeScript project:
```bash
yarn build
```

## Running the Demo

### Step 1: Start the Seller

The seller must be running before the buyer can make requests.

**Development mode** (with hot reload):
```bash
yarn dev-seller
```

**Production mode**:
```bash
yarn seller
```

The seller server will start on `http://localhost:4021` and expose the `/weather` endpoint that requires payment.

### Step 2: Run the Buyer

Once the seller is running, open a new terminal and run the buyer:

**Development mode**:
```bash
yarn dev-buyer
```

**Production mode**:
```bash
yarn buyer
```

The buyer will:
1. Automatically create a payment transaction in USDC
2. Send the request to the seller's `/weather` endpoint
3. Receive the weather data response
4. Display the payment transaction details

## Checking Transaction Confirmation

After running the buyer, you'll see output similar to:

```json
{
  "report": {
    "weather": "sunny",
    "temperature": 70
  }
}

// Payment response:
{
  "success": true,
  "payer": "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4",
  "transaction": "3HP9begnJ2nNUTufDaPNfoxMkWdD92PDsBWrFgPXS44x1YYjjoJNChju3zeGbm9YbyGP1BB9Urr9kUJC57pUde3j",
  "network": "solana"
}
```

To verify the transaction on Solana:

1. Copy the `transaction` from the payment response
2. Visit Solscan to view
3. Verify the USDC transfer from buyer to seller

## Project Structure

```
x402-demo/
├── src/
│   ├── seller.ts      # Express server with payment middleware
│   └── buyer.ts       # Client that makes paid API requests
├── dist/              # Compiled JavaScript output
├── .env               # Environment configuration (not in git)
├── .env.example       # Example environment variables
├── package.json       # Project dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## How It Works

1. **Seller Setup**: The seller configures the [paymentMiddleware](src/seller.ts#L11) with:
   - Receiving wallet address
   - Route configurations with pricing
   - Facilitator URL for payment processing

2. **Payment Flow**:
   - Buyer makes a request using `wrapFetchWithPayment`
   - The client automatically creates and signs a USDC payment transaction
   - Payment details are sent in the request headers
   - Facilitator validates the payment
   - Seller's middleware verifies payment before processing the request

3. **Response**: The seller returns:
   - The requested data in the response body
   - Payment confirmation in the `x-payment-response` header

## Configuration

### Changing the API Price

Edit [src/seller.ts:17](src/seller.ts#L17) to adjust the price:

```typescript
"GET /weather": {
  price: "0.01", // Change this value (in USD)
  network: "solana",
  // ...
}
```

### Using a Different Facilitator

You can self-host a facilitator or use a different one by updating:
- `.env` file: `FACILITATOR_URL`
- [src/seller.ts:38](src/seller.ts#L38): The `url` option in payment middleware config

## Troubleshooting

**Buyer has no USDC:**

- Error below:
```
SolanaError: Transaction failed when it was simulated in order to estimate the compute unit consumption. The compute unit estimate provided is for a transaction that failed when simulated and may not be representative of the compute units this transaction would consume if successful. Inspect the `cause` property of this error to learn more
    at simulateTransactionAndGetConsumedUnits (file:///Users/wild-west/playfield/x402-demo/node_modules/@solana-program/compute-budget/src/estimateComputeLimitInternal.ts:175:13)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at estimateComputeUnitLimit (file:///Users/wild-west/playfield/x402-demo/node_modules/@solana-program/compute-budget/src/estimateComputeLimitInternal.ts:132:10)
    at estimateComputeUnitLimitFactoryFunction (file:///Users/wild-west/playfield/x402-demo/node_modules/@solana-program/compute-budget/src/estimateComputeLimit.ts:74:12)
    at createTransferTransactionMessage (file:///Users/wild-west/playfield/x402-demo/node_modules/x402/src/schemes/exact/svm/client.ts:125:26)
    at createAndSignPayment (file:///Users/wild-west/playfield/x402-demo/node_modules/x402/src/schemes/exact/svm/client.ts:73:30)
    at createPaymentHeader2 (file:///Users/wild-west/playfield/x402-demo/node_modules/x402/src/schemes/exact/svm/client.ts:49:26)
    at createPaymentHeader3 (file:///Users/wild-west/playfield/x402-demo/node_modules/x402/src/client/createPaymentHeader.ts:45:14)
    at file:///Users/wild-west/playfield/x402-demo/node_modules/x402-fetch/src/index.ts:93:27 {
  cause: { InstructionError: [ 2n, 'InvalidAccountData' ] },
  context: { __code: 5663019, unitsConsumed: 23650 }
}
```
- Solution: send some USDC

**Buyer fails with "Insufficient funds":**
- Ensure your buyer wallet has enough USDC (check balance on Solana Explorer)
- Make sure you're using the mainnet USDC token

**Connection refused errors:**
- Verify the seller is running on port 4021
- Check firewall settings if applicable

**Transaction not confirming:**
- Solana network may be congested; wait a few moments
- Check the transaction status on Solana Explorer

## Learn More

- [x402 Documentation](https://github.com/coinbase/x402)

## License

MIT
## contact info


Gmail: benjamin.bigdev@gmail.com

Telegram: [@SOLBenjaminCup](https://t.me/SOLBenjaminCup)

Discord: [@.benjamincup](https://discord.com/channels/@me/1305610537790476382)