import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { initDb } from '../db/schema'

export const trackCommand = new Command('track')
  .description('Track a product for price changes and availability')
  .argument('<product-id>', 'Product ID to track')
  .option('-t, --target-price <price>', 'Target price for notifications', parseFloat)
  .action(async (productId, options) => {
    const db = initDb('./data/dropshipping.db')
    const spinner = ora(`Setting up tracking for ${productId}...`).start()
    
    try {
      // Check if product exists
      const product = await new Promise<any>((resolve, reject) => {
        db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
          if (err) reject(err)
          else resolve(row)
        })
      })
      if (!product) {
        spinner.fail(`Product ${productId} not found. Run 'search' first.`)
        process.exit(1)
      }
      
      // Insert or update tracking
      const trackingId = crypto.randomUUID()
      db.run(
        `INSERT OR REPLACE INTO tracking (id, product_id, target_price, notifications, created_at)
         VALUES (?, ?, ?, 1, datetime('now'))`,
        [trackingId, productId, options.targetPrice || null]
      )
      
      spinner.succeed(`Now tracking ${product.name}`)
      
      if (options.targetPrice) {
        console.log(chalk.blue(`Target price set: $${options.targetPrice.toFixed(2)}`))
      }
      
      console.log(chalk.gray('Run `analyze` to see tracking dashboard'))
      
    } catch (error: any) {
      spinner.fail('Tracking setup failed')
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })
