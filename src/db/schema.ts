import { Database } from 'sqlite3'
import { z } from 'zod'

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  source: z.string(),
  sourceUrl: z.string(),
  category: z.string().optional(),
  images: z.array(z.string()).default([]),
  price: z.number(),
  currency: z.string().default('USD'),
  shippingCost: z.number().default(0),
  rating: z.number().optional(),
  reviewCount: z.number().default(0),
  ordersCount: z.number().default(0),
  sellerRating: z.number().optional(),
  sellerName: z.string().optional(),
  variants: z.array(z.object({
    name: z.string(),
    price: z.number(),
    stock: z.number()
  })).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const PriceHistorySchema = z.object({
  id: z.string(),
  productId: z.string(),
  price: z.number(),
  shippingCost: z.number(),
  timestamp: z.string().datetime()
})

export const CompetitorSchema = z.object({
  id: z.string(),
  productId: z.string(),
  platform: z.string(),
  competitorUrl: z.string(),
  price: z.number(),
  rating: z.number().optional(),
  reviewCount: z.number().default(0),
  stock: z.number().optional(),
  scrapedAt: z.string().datetime()
})

export const TrackingSchema = z.object({
  id: z.string(),
  productId: z.string(),
  targetPrice: z.number().optional(),
  notifications: z.boolean().default(true),
  createdAt: z.string().datetime()
})

export type Product = z.infer<typeof ProductSchema>
export type PriceHistory = z.infer<typeof PriceHistorySchema>
export type Competitor = z.infer<typeof CompetitorSchema>
export type Tracking = z.infer<typeof TrackingSchema>

export function initDb(dbPath: string): Database {
  const db = new Database(dbPath)
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      source TEXT NOT NULL,
      source_url TEXT NOT NULL,
      category TEXT,
      images TEXT,
      price REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      shipping_cost REAL DEFAULT 0,
      rating REAL,
      review_count INTEGER DEFAULT 0,
      orders_count INTEGER DEFAULT 0,
      seller_rating REAL,
      seller_name TEXT,
      variants TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_source ON products(source);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

    CREATE TABLE IF NOT EXISTS price_history (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      price REAL NOT NULL,
      shipping_cost REAL DEFAULT 0,
      timestamp TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp);

    CREATE TABLE IF NOT EXISTS competitors (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      platform TEXT NOT NULL,
      competitor_url TEXT NOT NULL,
      price REAL NOT NULL,
      rating REAL,
      review_count INTEGER DEFAULT 0,
      stock INTEGER,
      scraped_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_competitors_product ON competitors(product_id);
    CREATE INDEX IF NOT EXISTS idx_competitors_platform ON competitors(platform);

    CREATE TABLE IF NOT EXISTS tracking (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL UNIQUE REFERENCES products(id),
      target_price REAL,
      notifications INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `)
  
  return db
}
