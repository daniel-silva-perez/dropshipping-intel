# Dropshipping Intel CLI

TypeScript CLI for ecommerce product research, price tracking, competitor checks, and local-first analysis. It is designed as an operator tool: quick commands, structured output, and a SQLite-backed workflow that can grow into a dashboard or automated sourcing system.

## What It Does

- Search product candidates with filters
- Track products and target prices locally
- Run profit and market-positioning analysis
- Compare product candidates against competitor channels
- Export structured results to CSV or JSON

## Why It Matters

The interesting part is not dropshipping itself; it is turning fragmented commerce research into a repeatable data workflow. The repo shows CLI design, TypeScript architecture, local persistence, and clear extension points for real supplier APIs.

## Tech Stack

- TypeScript
- Commander.js
- SQLite
- Axios and Cheerio
- CSV/JSON export workflow

## Run Locally

```bash
npm install
npx tsx src/index.ts search "wireless earbuds" -l 10
npx tsx src/index.ts analyze
```

## Data Sources

The current public version uses mock/demo data. Real integrations would require official supplier APIs or compliant data providers for AliExpress, CJ Dropshipping, Spocket, or similar catalogs.

## Status

CLI prototype with clear API-integration seams. Not a production scraping system.
