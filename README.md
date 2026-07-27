# Commodity Exchange Platform

**MSc Computing Science (Software Development) Dissertation**
University of Glasgow | 2025-26
Student: Sumit Kumar  (3167833K)
Supervisor: Blair Archibald

---
> **Note:** This README reflects the current project plan and proposed architecture. Nothing has been implemented or finalised at this stage. All architectural and technical decisions are subject to change pending supervisor feedback. This document is intended to provide a high-level overview for reference purposes only.

## Project Overview

CommodEx is a B2B SaaS platform for UK industrial SMEs and commodity traders. It provides three integrated core features: an agentic RAG based commodity intelligence system that retrieves live and historical price data to answer natural language procurement queries, a real-time pricing dashboard, and a barter matching engine for surplus raw material exchange. The platform includes a guardrails layer for AI safety and a RAGAS evaluation pipeline to measure response quality.

---

## Repository Structure

```
commodityexchange/
├── frontend/           # React + TypeScript SPA
├── backend/            # Single FastAPI application (one server, one deployment)
│   ├── main.py         # Entry point - registers all modules
│   ├── rag/            # RAG module (/api/chat)
│   ├── barter/         # Barter matching engine module (/api/barter)
│   ├── pricing/        # Commodity pricing module (/api/prices)
│   ├── guardrails/     # Applied on every request automatically
│   ├── ingestion/      # Run locally only, not deployed
│   ├── evaluation/     # Run locally only, not deployed
│   └── requirements.txt
├── data/               # Local data files, not deployed
│   ├── chroma_db/
│   ├── chunks.json
│   └── worldbank_clean.csv
└── README.md
```
---

## Tech Stack

|----------------------------------------------------------------------|
| Layer                |   Technology                                  |
|----------------------|-----------------------------------------------| 
| Frontend             | React, TypeScript, Tailwind CSS, shadcn/ui    |
| Backend              | FastAPI (Python) — single server, all modules |
| LLM                  | Groq LLaMA-3.3-70B                            |
| Vector DB            | ChromaDB                                      |
| Embeddings           | HuggingFace all-MiniLM-L6-v2 API              |
| Relational DB        | Supabase (PostgreSQL)                         |
| Historical Data      | World Bank Pink Sheet                         |
| Live Price Data      | Alpha Vantage API                             |
| Evaluation           | RAGAS                                         |
| Frontend Deploy      | Netlify                                       |
| Backend Deploy       | Render                                        |

---

## Core Features

**1. RAG Chatbot (/chat)**
Agentic commodity intelligence system that accepts natural language procurement queries from SME users, retrieves semantically relevant historical price context from ChromaDB using HuggingFace embeddings, fetches live commodity prices via Alpha Vantage, and generates contextualised procurement recommendations using Groq LLaMA-3.3-70B.

**2. Pricing Dashboard (/prices)**
Historical and live commodity price visualisation for 14 commodities across metals, energy, and agriculture with trend charts and category filters.

**3. Barter Matching Engine (/barter)**
Rule-based P2P surplus raw material matching between UK industrial SMEs with fair value calculation using current World Bank prices and simulated settlement summary.

**4. RAGAS Evaluation Dashboard (/evals)**
Automated evaluation of RAG pipeline quality across four metrics: Faithfulness, Answer Relevancy, Context Precision, and Context Recall.

**5. Guardrails Layer**
Topic guard, hallucination check, and toxicity filter applied on every query and response automatically.

---

## Branch Strategy

| Branch              | Purpose                                           |
|---------------------|---------------------------------------------------|
| `main`              | Production ready stable code only                 |
| `develop`           | Integration branch, all features merge here first |
| `feature/frontend`  | React UI development                              |
| `feature/backend`   | FastAPI backend development                       |

---

## Local Setup

## Data Setup (Run Locally)- if you want to see intelligence answer before hand.

Download World Bank Pink Sheet:
https://thedocs.worldbank.org/en/doc/74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/related/CMO-Historical-Data-Monthly.xlsx
Place in data/ folder then run:

cd backend
python ingestion/clean_worldbank.py
python ingestion/transform_chunks.py
python ingestion/embed_store.py

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Backend: `http://localhost:8000`
Frontend: `http://localhost:3000`

---

## Data Pipeline (Run Locally Only) - Explained above on line number - 90

```bash
cd backend
python ingestion/clean_worldbank.py
python ingestion/transform_chunks.py
python ingestion/embed_store.py
```

## Evaluation (Run Locally Only)

```bash
cd backend
python evaluation/ragas_eval.py
```

---

## Deployment

| Service  | Platform  | Directory |
|----------|-----------|-----------|
| Frontend | Netlify   | frontend/ |
| Backend  | Render    | backend/  |
| Database | Supabase  | Managed   |

---

*CommodityExchange | MSc Computing Science Dissertation | University of Glasgow 2025-26 | Supervisor: Blair Archibald*