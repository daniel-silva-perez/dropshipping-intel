import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { AliExpressScraper } from '../scrapers/aliexpress'
import { CJScraper } from '../scrapers/cjdropshipping'
import { initDb } from '../db/schema'

export const searchCommand = new Command('search')
  .description('Search for dropshipping products')
  .argument('<query>', 'Search query')
  .option('-s, --source <source>', 'Source platform (aliexpress, cjdropshipping, all)', 'all')
  .option('-c, --category <category>', 'Filter by category')
  .option('-p, --max-price <price>', 'Maximum price', parseFloat)
  .option('-r, --min-rating <rating>', 'Minimum rating', parseFloat)
  .option('-l, --limit <limit>', 'Number of results', '20')
  .action(async (query, options) => {
    const spinner = ora('Searching products...').start()
    
    try {
      const db = initDb('./data/dropshipping.db')
      const results = []
      
      if (options.source === 'all' || options.source === 'aliexpress') {
        const ali = new AliExpressScraper()
        const aliResults = await ali.search(query, {
          maxPrice: options.maxPrice,
          minRating: options.minRating,
          limit: parseInt(options.limit)
        })
        results.push(...aliResults)
      }
      
      if (options.source === 'all' || options.source === 'cjdropshipping') {
        const cj = new CJScraper()
        const cjResults = await cj.search(query, {
          maxPrice: options.maxPrice,
          minRating: options.minRating,
          limit: parseInt(options.limit)
        })
        results.push(...cjResults)
      }
      
      // Save to database
      for (const product of results) {
        db.run(
          `INSERT OR REPLACE INTO products (id, name, description, source, source_url, category, images, price, currency, shipping_cost, rating, review_count, orders_count, seller_rating, seller_name, variants, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [product.id, product.name, product.description || '', product.source, product.sourceUrl, product.category || '', JSON.stringify(product.images), product.price, product.currency, product.shippingCost, product.rating || null, product.reviewCount, product.ordersCount, product.sellerRating || null, product.sellerName || null, JSON.stringify(product.variants), product.createdAt, product.updatedAt],
          (err: any) => {
            if (err) console.error('DB insert error:', err.message)
          }
        )
      }
      
      spinner.succeed(`Found and saved ${results.length} products`)
      
      // Display results
      console.log('\n' + chalk.bold('Search Results:'))
      results.forEach((product, i) => {
        const profit = calculatePotentialProfit(product.price)
        console.log(`\n${chalk.cyan(`${i + 1}. ${product.name}`)}`)
        console.log(`   Price: ${chalk.green(`$${product.price.toFixed(2)}`)}`)
        console.log(`   Potential Profit: ${chalk.yellow(`$${profit.toFixed(2)}`)}`)
        console.log(`   Rating: ${product.rating ? chalk.green(product.rating.toFixed(1)) : chalk.gray('N/A')}`)
        console.log(`   Orders: ${chalk.blue(product.ordersCount || 0)}`)
        console.log(`   Source: ${chalk.gray(product.source)}`)
        console.log(`   ID: ${chalk.gray(product.id)}`)
      })
      
    } catch (error: any) {
      spinner.fail('Search failed')
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })

function calculatePotentialProfit(costPrice: number): number {
  const retailPrice = costPrice * 2.5
  const platformFees = retailPrice * 0.15
  const shipping = 5
  return retailPrice - costPrice - platformFees - shipping
}
