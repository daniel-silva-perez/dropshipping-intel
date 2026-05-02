import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { initDb } from '../db/schema'

export const analyzeCommand = new Command('analyze')
  .description('Analyze products, trends, and profitability')
  .argument('[product-id]', 'Specific product to analyze')
  .option('-t, --trends', 'Show trending products', false)
  .option('-p, --profit', 'Show profit analysis', false)
  .option('-c, --competition', 'Show competition analysis', false)
  .action(async (productId, options) => {
    const db = await initDb('./data/dropshipping.db')
    const spinner = ora('Analyzing...').start()
    
    try {
      if (productId) {
        // Analyze specific product
        const product = await new Promise<any>((resolve, reject) => {
          db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
            if (err) reject(err)
            else resolve(row)
          })
        })
        if (!product) {
          spinner.fail(`Product ${productId} not found`)
          process.exit(1)
        }
        
        // Get price history
        const priceHistory = await new Promise<any[]>((resolve, reject) => {
          db.all('SELECT * FROM price_history WHERE product_id = ? ORDER BY timestamp DESC LIMIT 30', [productId], (err, rows) => {
            if (err) reject(err)
            else resolve(rows as any[])
          })
        })
        
        // Get competitors
        const competitors = await new Promise<any[]>((resolve, reject) => {
          db.all('SELECT * FROM competitors WHERE product_id = ? ORDER BY scraped_at DESC', [productId], (err, rows) => {
            if (err) reject(err)
            else resolve(rows as any[])
          })
        })
        
        // Calculate metrics
        const avgPrice = priceHistory.length > 0
          ? priceHistory.reduce((sum: number, p: any) => sum + p.price, 0) / priceHistory.length
          : product.price
        
        const priceTrend = priceHistory.length > 1
          ? ((priceHistory[0].price - priceHistory[priceHistory.length - 1].price) / priceHistory[priceHistory.length - 1].price) * 100
          : 0
        
        const retailPrice = product.price * 2.5
        const profitMargin = ((retailPrice - product.price - 5) / retailPrice * 100)
        
        spinner.succeed('Analysis complete')
        
        console.log('\n' + chalk.bold.cyan('Product Analysis'))
        console.log(chalk.gray('═'.repeat(50)))
        console.log(`${chalk.bold('Product:')} ${product.name}`)
        console.log(`${chalk.bold('Source:')} ${product.source}`)
        console.log(`${chalk.bold('Current Price:')} ${chalk.green('$' + product.price.toFixed(2))}`)
        console.log(`${chalk.bold('Avg Price (30d):')} $${avgPrice.toFixed(2)}`)
        console.log(`${chalk.bold('Price Trend:')} ${priceTrend > 0 ? chalk.red('+' + priceTrend.toFixed(1) + '%') : chalk.green(priceTrend.toFixed(1) + '%')}`)
        console.log(`${chalk.bold('Rating:')} ${product.rating ? chalk.yellow(product.rating.toFixed(1) + '/5') : 'N/A'}`)
        console.log(`${chalk.bold('Orders:')} ${chalk.blue(product.orders_count || 0)}`)
        
        console.log('\n' + chalk.bold.cyan('Profitability'))
        console.log(chalk.gray('─'.repeat(50)))
        console.log(`${chalk.bold('Retail Price (2.5x):')} ${chalk.green('$' + retailPrice.toFixed(2))}`)
        console.log(`${chalk.bold('Est. Profit Margin:')} ${profitMargin > 30 ? chalk.green(profitMargin.toFixed(1) + '%') : chalk.yellow(profitMargin.toFixed(1) + '%')}`)
        console.log(`${chalk.bold('Est. Profit/Unit:')} $${(retailPrice - product.price - 5).toFixed(2)}`)
        
        if (competitors.length > 0) {
          console.log('\n' + chalk.bold.cyan('Competitor Analysis'))
          console.log(chalk.gray('─'.repeat(50)))
          competitors.forEach((comp: any) => {
            const diff = ((comp.price - retailPrice) / retailPrice * 100)
            console.log(`${chalk.bold(comp.platform)}: ${chalk.green('$' + comp.price.toFixed(2))} (${diff > 0 ? chalk.red('+' + diff.toFixed(1) + '%') : chalk.green(diff.toFixed(1) + '%')} vs your price)`)
          })
        }
        
      } else {
        // Dashboard view
        const trackedProducts = await new Promise<any[]>((resolve, reject) => {
          db.all(`
            SELECT p.*, t.target_price 
            FROM products p 
            JOIN tracking t ON p.id = t.product_id 
            ORDER BY p.updated_at DESC
          `, [], (err, rows) => {
            if (err) reject(err)
            else resolve(rows as any[])
          })
        })
        
        spinner.succeed(`Tracking ${trackedProducts.length} products`)
        
        console.log('\n' + chalk.bold.cyan('📊 Tracking Dashboard'))
        console.log(chalk.gray('═'.repeat(60)))
        
        trackedProducts.forEach((p: any) => {
          const profit = (p.price * 2.5 - p.price - 5)
          const status = p.target_price && p.price <= p.target_price
            ? chalk.green('✓ Target reached!')
            : chalk.gray('Watching')
          
          console.log(`\n${chalk.bold(p.name)} ${status}`)
          console.log(`   Current: ${chalk.green('$' + p.price.toFixed(2))} ${p.target_price ? `| Target: $${p.target_price.toFixed(2)}` : ''}`)
          console.log(`   Est. Profit: ${chalk.yellow('$' + profit.toFixed(2))}`)
        })
      }
      
    } catch (error: any) {
      spinner.fail('Analysis failed')
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })
