import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { initDb } from '../db/schema'
import { writeFile } from 'fs/promises'

export const exportCommand = new Command('export')
  .description('Export product data to CSV or JSON')
  .option('-f, --format <format>', 'Export format (csv, json)', 'json')
  .option('-o, --output <path>', 'Output file path')
  .option('--tracked-only', 'Export only tracked products', false)
  .action(async (options) => {
    const db = initDb('./data/dropshipping.db')
    const spinner = ora('Exporting data...').start()
    
    try {
      let query = 'SELECT * FROM products'
      if (options.trackedOnly) {
        query += ' WHERE id IN (SELECT product_id FROM tracking)'
      }
      query += ' ORDER BY updated_at DESC'
      
      const products = await new Promise<any[]>((resolve, reject) => {
        db.all(query, [], (err, rows) => {
          if (err) reject(err)
          else resolve(rows as any[])
        })
      })
      
      const timestamp = new Date().toISOString().slice(0, 10)
      const outputPath = options.output || `./data/export-${timestamp}.${options.format}`
      
      if (options.format === 'csv') {
        const headers = ['id', 'name', 'source', 'price', 'currency', 'rating', 'review_count', 'orders_count', 'source_url']
        const rows = products.map((p: any) => [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.source,
          p.price,
          p.currency,
          p.rating || '',
          p.review_count,
          p.orders_count,
          p.source_url
        ])
        
        const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n')
        await writeFile(outputPath, csv)
        
      } else {
        await writeFile(outputPath, JSON.stringify(products, null, 2))
      }
      
      spinner.succeed(`Exported ${products.length} products to ${outputPath}`)
      
    } catch (error: any) {
      spinner.fail('Export failed')
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })
