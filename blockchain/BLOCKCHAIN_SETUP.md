# Blockchain Integration Setup Guide

## Overview

The IMS system now supports **real** blockchain storage of student card hashes.

- **Smart Contract**: `blockchain/contracts/StudentLedger.sol` — stores card ID → SHA-256 hash on-chain.
- **Edge Function**: `supabase/functions/issue-blockchain-record/index.ts` — called during card issuance to write the hash to the blockchain.
- **Local Node**: `blockchain/compile-and-deploy.mjs` — starts a local Ganache node and deploys the contract.

---

## Local Development Setup (One-Time)

### 1. Start the local blockchain node

Open a terminal and run:

```bash
cd ims-web/blockchain
node compile-and-deploy.mjs
```

This will:
- Compile `StudentLedger.sol` 
- Start a local blockchain at `http://127.0.0.1:8545`
- Deploy the contract
- Save deployment info to `blockchain/artifacts/deployment.json`

### 2. Configure Supabase Edge Function Secrets

After running step 1, copy the values from `blockchain/artifacts/deployment.json` and set them as Supabase secrets:

```bash
supabase secrets set BLOCKCHAIN_RPC_URL="http://127.0.0.1:8545"
supabase secrets set BLOCKCHAIN_CONTRACT_ADDRESS="<contractAddress from deployment.json>"
supabase secrets set BLOCKCHAIN_PRIVATE_KEY="<deployerPrivateKey from deployment.json>"
```

> **Note**: For local dev, the Supabase Edge Function must also be running locally via `supabase functions serve` so it can reach your local blockchain at `127.0.0.1:8545`.

### 3. Issue a card

Go to any student's profile → "Issue Digital Card". The issuance wizard now has a new step "Write to Blockchain" that:
1. Calls the `issue-blockchain-record` Edge Function
2. Sends a real transaction to your local `StudentLedger` contract
3. Waits for the tx receipt and stores the **real txHash** in Supabase

---

## Production Deployment (Testnet)

For a public testnet (e.g., Polygon Amoy or Sepolia):

1. Get a funded wallet private key and an RPC URL from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
2. Deploy the contract to the testnet:
   ```bash
   # Update blockchain/hardhat.config.js with network details
   # then: npx hardhat run scripts/deploy.js --network sepolia
   ```
3. Set production secrets in Supabase Dashboard → Settings → Edge Functions:
   - `BLOCKCHAIN_RPC_URL` = your Alchemy/Infura URL
   - `BLOCKCHAIN_CONTRACT_ADDRESS` = deployed contract address
   - `BLOCKCHAIN_PRIVATE_KEY` = funded wallet private key

---

## Files Created

| File | Purpose |
|------|---------|
| `blockchain/contracts/StudentLedger.sol` | Solidity smart contract |
| `blockchain/compile-and-deploy.mjs` | Local node launcher + deployment script |
| `blockchain/hardhat.config.js` | Hardhat config (for testnet deploys) |
| `blockchain/scripts/deploy.js` | Hardhat deployment script |
| `supabase/functions/issue-blockchain-record/index.ts` | Edge Function: writes hash to chain |
| `src/pages/IssueCardPage.tsx` | Updated to call the Edge Function |
