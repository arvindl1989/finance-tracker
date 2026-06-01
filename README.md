# EquityLens — Portfolio Intelligence Platform

A professional-grade equity portfolio analytics and decision-support system built for long-term investors.

## Features

| Dashboard | What it does |
|---|---|
| **Overview** | KPI cards, portfolio value chart, top gainers, buy signals |
| **Allocation** | Industry/market-cap donut charts, stock treemap, concentration alerts |
| **P&L** | Stock-wise & industry-wise P&L, horizontal bar charts, sortable table |
| **Valuation** | PE heatmap vs historical averages, Graham Number, Margin of Safety |
| **Buy Engine** | Buy score (0–100) per stock using 7 factors, radar charts, ranked table |
| **Sell Engine** | Sell score, profit-booking rules, suggested sell amount & quantity |
| **Rebalancing** | Target vs current allocation, trade amounts and quantities |
| **Risk** | HHI index, radar chart, per-stock concentration and D/E risk |
| **Quality** | Quality score from ROE/ROCE/debt/growth, ranked cards and bar chart |
| **Alerts** | 52W High/Low, PE alerts, allocation breaches — read/unread |
| **Watchlist** | Track potential buys with price/PE/MOS targets |
| **Import** | Drag-and-drop CSV/Excel upload with auto column mapping |

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS, shadcn/ui
- **Charts**: Recharts (area, bar, pie, scatter, radar, treemap)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js (ready to configure)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone and install
```bash
cd equity-portfolio
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Set up database
```bash
# Push schema to database
npm run db:push

# Seed with 12 sample Indian equity holdings
npm run db:seed
```

### 4. Generate Prisma client
```bash
npm run db:generate
```

### 5. Start development server
```bash
npm run dev
# Open http://localhost:3000
```

## Docker (Full Stack)

```bash
# Start PostgreSQL + App
docker-compose up -d

# In a separate terminal, run migrations and seed
docker-compose exec app npx prisma db push
docker-compose exec app npm run db:seed
```

## Sample Data

The seed script creates a demo portfolio with 12 Indian large-cap stocks:
RELIANCE, TCS, HDFCBANK, INFY, BAJFINANCE, WIPRO, MARUTI, ASIANPAINT, SUNPHARMA, TITAN, PIDILITIND, NESTLEIND

Each holding includes full valuation metrics (PE, Graham Number, ROE, ROCE, D/E) and computed scores.

## Importing Your Own Data

Go to `/dashboard/import` and upload a CSV or Excel file with these columns:
```
StockCode, CompanyName, Industry, Quantity, AverageBuyPrice, CurrentPrice
```
Optional columns: CurrentPE, HistoricalAveragePE, EPS, BookValuePerShare, ROEPercent, ROCEPercent, DebtToEquityRatio, Week52High, Week52Low

## Formulas Implemented

| Formula | Implementation |
|---|---|
| Current Value | `Quantity × CurrentPrice` |
| Gain/Loss | `CurrentValue - TotalCost` |
| Gain/Loss % | `(GainLoss / TotalCost) × 100` |
| Graham Number | `√(22.5 × EPS × BVPS)` |
| Margin of Safety | `(GrahamNumber - Price) / GrahamNumber × 100` |
| Buy Score | Weighted sum of PE, MOS, ROE, ROCE, growth, debt (0–100) |
| Sell Score | Gain>100%, PE excess, overweight, near 52WH (0–100) |
| Quality Score | ROE + ROCE + low debt + EPS growth (0–100) |
| HHI | `Σ(weight²) × 10000` (concentration index) |

## Architecture

```
src/
├── app/
│   ├── api/           # REST API routes (portfolio, alerts, import)
│   └── dashboard/     # All dashboard pages (11 routes)
├── components/
│   ├── layout/        # Sidebar, Header
│   ├── dashboard/     # KPI cards and shared widgets
│   └── ui/            # shadcn/ui primitives
├── hooks/
│   └── use-portfolio.ts   # Data fetching hook
└── lib/
    ├── db.ts          # Prisma client singleton
    └── utils.ts       # Formatters, calculators, color helpers
prisma/
├── schema.prisma      # Full data model
└── seed.ts            # 12 holdings + alerts + snapshots
```

## Extending the System

**Add live prices**: Replace `currentPrice` in seed/import with a call to NSE/BSE API or Yahoo Finance  
**Add auth**: Configure NextAuth providers in `src/app/api/auth/[...nextauth]/route.ts`  
**Add PDF export**: Use `jspdf` + `html2canvas` on any dashboard page  
**Add email alerts**: Wire `nodemailer` into the alert generation logic  
**Multi-portfolio**: The Prisma schema supports multiple portfolios per user
