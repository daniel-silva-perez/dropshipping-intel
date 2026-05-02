# Dropshipping Intel CLI

Dropshipping product intelligence and analytics CLI tool. Search, track, analyze, and find winning products across supplier platforms.

## Features

- **Search** — Find products from AliExpress, CJ Dropshipping with price/rating filters
- **Track** — Monitor products for price changes with target price alerts
- **Analyze** — Profit calculations, price trends, market positioning
- **Competitor Analysis** — Compare against Amazon, Walmart, Shopify listings
- **Export** — CSV/JSON export for further analysis

## Quick Start

```bash
# Clone and install
git clone https://github.com/daniel-silva-perez/dropshipping-intel.git
cd dropshipping-intel
npm install

# Search products
npx tsx src/index.ts search "wireless earbuds" -l 10

# Track a product
npx tsx src/index.ts track <product-id> -t 15.00

# Analyze tracked products
npx tsx src/index.ts analyze

# Competitor analysis
npx tsx src/index.ts competitor <product-id>
```

## Commands

| Command | Description |
|---------|-------------|
| `search <query>` | Search products with filters |
| `track <id>` | Track product for price changes |
| `analyze [id]` | Product analysis & dashboard |
| `list` | List all tracked products |
| `export` | Export to CSV/JSON |
| `competitor <id>` | Analyze competitor pricing |

## Data Sources

Currently uses **mock data** for demonstration. To connect real suppliers:

- **AliExpress** — Requires official API or scraping service with proxies
- **CJ Dropshipping** — Has official API available
- **Spocket** — Shopify-integrated supplier API
- **SaleHoo** — Supplier directory with product data

## Architecture

- **CLI**: Commander.js with Chalk/Ora for UX
- **Database**: SQLite (local-first, zero-config)
- **Scrapers**: Axios + Cheerio (extensible to Puppeteer)
- **TypeScript**: Strict mode, CommonJS output

## Vercel Deployment

This is a **CLI tool**, not a web app. To deploy:

1. **Option A**: Run on your local machine or server (recommended)
2. **Option B**: Convert to Next.js API + dashboard (see below)
3. **Option C**: Deploy as Vercel Edge Function for API access

### Converting to Web Dashboard

To make this a deployable web app:

```bash
# Add Next.js
npm install next react react-dom

# Create API routes for each command
# src/app/api/search/route.ts
# src/app/api/track/route.ts
# etc.

# Build React dashboard
# src/app/page.tsx — Product search UI
# src/app/track/page.tsx — Tracking dashboard
# src/app/analyze/page.tsx — Analytics charts
```

Then deploy to Vercel:
```bash
vercel --prod
```

## Environment Variables

```env
# Optional: Database path
DATABASE_URL=./data/dropshipping.db

# Optional: AliExpress API key
ALIEXPRESS_API_KEY=your_key

# Optional: CJ Dropshipping API key
CJ_API_KEY=your_key
```

## Roadmap

- [ ] Real AliExpress API integration
- [ ] CJ Dropshipping API integration
- [ ] Shopify/Walmart/Amazon scrapers
- [ ] Price alert notifications (email/Telegram)
- [ ] Web dashboard with charts
- [ ] Chrome extension for one-click product import

## License

MIT
