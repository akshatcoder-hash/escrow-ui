# Anchor Escrow UI

## Description

Anchor Escrow UI is a React-based frontend application for interacting with the Anchor Escrow smart contract on the Solana blockchain. This project provides a user-friendly interface for creating, managing, and interacting with escrow agreements.

## Features

- Connect to Solana wallets
- Create new escrow agreements
- Refund escrow agreements
- Take (complete) escrow agreements
- View active escrows
- Real-time balance updates

## Prerequisites

- Node.js (v14 or later)
- Yarn or npm
- A Solana wallet (e.g., Phantom, Solflare)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/akshatcoder-hash/anchor-escrow-ui.git
   cd anchor-escrow-ui
   ```

2. Install dependencies:
   ```
   yarn install
   ```
   or
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Solana network configuration:
   ```
   VITE_SOLANA_NETWORK=devnet
   VITE_RPC_ENDPOINT=https://api.devnet.solana.com
   ```

## Running the Application

To start the development server:

```
yarn dev
```
or
```
npm run dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

To create a production build:

```
yarn build
```
or
```
npm run build
```

## Testing

To run the test suite:

```
yarn test
```
or
```
npm test
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
