# 🌐 EchoChain Live Server Vercel Deployment Guide

This guide walks you through deploying **EchoChain** to a live URL on **Vercel** with full working condition across all authentication, audio processing, acoustic analysis, Supabase database storage, Pinata IPFS, Polygon testnet, and consumer QR verification pages.

---

## ⚡ Quick Deployment Steps (Vercel Web Dashboard)

### Step 1: Push Code to GitHub
Ensure your latest EchoChain codebase is pushed to your GitHub repository.

### Step 2: Import Project into Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select your **EchoChain** repository and click **Import**.

---

## ⚙️ Configuration Settings in Vercel

When importing the project in Vercel, set the following parameters:

- **Framework Preset**: `Vite`
- **Root Directory**: `./` (or leave default root)
- **Build Command**: `npm --prefix frontend install && npm --prefix frontend run build`
- **Output Directory**: `frontend/dist`

---

## 🔑 Environment Variables (Vercel Environment Settings)

Under **Project Settings** $\rightarrow$ **Environment Variables**, add the following keys:

| Environment Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | *(Leave empty for monorepo or enter your live API base URL)* | API base URL for frontend requests |
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` | Supabase PostgreSQL Connection String |
| `SUPABASE_URL` | `https://[REF].supabase.co` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Anonymous Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase Service Role Key |
| `SECRET_KEY` | `your_live_production_jwt_secret_key` | JWT Security Token Key |
| `PINATA_API_KEY` | `your_pinata_api_key` | Pinata IPFS Pinning Key |
| `PINATA_SECRET_API_KEY` | `your_pinata_secret_key` | Pinata IPFS Secret Key |
| `POLYGON_RPC_URL` | `https://rpc-amoy.polygon.technology` | Polygon Amoy Testnet RPC |
| `POLYGON_CONTRACT_ADDRESS` | `0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7` | Deployed EchoChain Polygon Contract |

---

## 🛠️ CLI Quick Deployment Option

You can also deploy directly from your terminal using the Vercel CLI:

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Deploy to Vercel Preview
vercel

# 3. Deploy to Production
vercel --prod
```

---

## ✅ Post-Deployment Verification Checklist

Once deployed to Vercel, verify all features on your live Vercel URL (`https://echo-chain.vercel.app`):

1. **Public Landing Page**: Load the home page and verify zero-location acoustic headline.
2. **Registration & Auth**: Register a new Producer / Certifier account and test login.
3. **Product Registration**: Create a new product batch (e.g. *Sidama Reserve Coffee*).
4. **Environmental Audio**: Record or upload an environmental WAV audio sample.
5. **Acoustic Analysis**: View the 128 Mel Spectrogram and MFCC feature matrix.
6. **Provenance Timeline**: Execute SHA-256 seal, IPFS pin, and Polygon anchor actions.
7. **Consumer Verification**: Scan/load `/verify/ECH-COFFEE-8821` and confirm privacy badge (*"Exact harvest coordinates are protected."*).
8. **Certifier Review**: Log in as a Certifier and approve/flag provenance records.
