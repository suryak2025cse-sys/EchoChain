<<<<<<< HEAD
# EchoChain
=======
# EchoChain: Privacy-Preserving Provenance Platform

EchoChain is an enterprise product provenance platform combining environmental acoustic signatures, AI feature extraction, SHA-256 cryptographic commitments, IPFS decentralized storage, and Polygon blockchain smart contracts.

---

## Repository Architecture

```text
EchoChain/
├── frontend/         # React + Vite + TypeScript + Tailwind CSS UI
├── backend/          # Python + FastAPI + PostgreSQL + SQLAlchemy API
├── ai-service/       # Librosa + PyTorch Signal Engine (Phase 5+)
├── blockchain/       # Solidity + Hardhat Smart Contracts (Phase 10+)
├── mobile/           # React Native + Expo App (Phase 17+)
├── docs/             # Technical Specifications & Diagrams
└── README.md
```

---

## Local Setup & Quick Start

### Prerequisites
- Node.js (v18+) & npm
- Python 3.10+
- PostgreSQL (optional, falls back to local SQLite if offline)

---

### Backend Setup (FastAPI)

1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
6. Access API Documentation:
   - Swagger UI: `http://localhost:8000/docs`
   - Health Endpoint: `http://localhost:8000/api/health`

---

### Frontend Setup (React + Vite)

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open browser at `http://localhost:5173`.

---

### Running Unit Tests

#### Backend Tests
```bash
cd backend
pytest
```

#### Frontend Build Verification
```bash
cd frontend
npm run build
```

---

## Phase 1 Verification Status
- ✅ FastAPI Backend Scaffolding with clean layered architecture (`api`, `core`, `models`, `schemas`, `services`, `repositories`, `utils`).
- ✅ Health-check endpoints active at `/api/health` and `/api/v1/health`.
- ✅ Database configuration with PostgreSQL + SQLAlchemy and SQLite dev fallback.
- ✅ React + Vite + TypeScript frontend with Tailwind CSS and dark mode aesthetics.
- ✅ Interactive Landing Page showcasing acoustic flow and trust architecture.
- ✅ Independent environment variable configuration (`.env.example` files).
>>>>>>> b135055 (initial Commit)
