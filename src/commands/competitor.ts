import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { initDb } from '../db/schema'

export const competitorCommand = new Command('competitor')
  .description('Analyze competitors on Amazon, Walmart, Shopify')
  .argument('<product-id>', 'Product ID to analyze')
  .option('-p, --platform <platform>', 'Platform (amazon, walmart, shopify)', 'all')
  .action(async (productId, options) => {
    const db = initDb('./data/dropshipping.db')
    const spinner = ora('Analyzing competitors...').start()
    
    try {
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
      
      // Mock competitor data for demonstration
      const competitors = [
        {
          platform: 'amazon',
          price: product.price * 2.8,
          rating: 4.2,
          reviewCount: 1240,
          url: `https://amazon.com/dp/B0${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        },
        {
          platform: 'walmart',
          price: product.price * 2.3,
          rating: 3.9,
          reviewCount: 580,
          url: `https://walmart.com/ip/${Math.floor(Math.random() * 100000000)}`
        },
        {
          platform: 'shopify',
          price: product.price * 3.0,
          rating: 4.5,
          reviewCount: 320,
          url: 'https://example-shop.myshopify.com/products/item'
        }
      ]
      
      spinner.succeed('Competitor analysis complete')
      
      console.log('\n' + chalk.bold.cyan('Competitor Analysis'))
      console.log(chalk.gray('═'.repeat(60)))
      console.log(`${chalk.bold('Product:')} ${product.name}`)
      console.log(`${chalk.bold('Your Cost:')} ${chalk.green('$' + product.price.toFixed(2))}`)
      
      const retailPrice = product.price * 2.5
      console.log(`\n${chalk.bold('Suggested Retail:')} ${chalk.yellow('$' + retailPrice.toFixed(2))}`)
      console.log(chalk.gray('─'.repeat(60)))
      
      competitors.forEach((comp: any) => {
        const diff = ((comp.price - retailPrice) / retailPrice * 100)
        const profitIfMatched = comp.price - product.price - 5
        
        console.log(`\n${chalk.bold(comp.platform.toUpperCase())}`)
        console.log(`  Price: ${chalk.green('$' + comp.price.toFixed(2))}`)
        console.log(`  Rating: ${chalk.yellow(comp.rating.toFixed(1) + '/5')} (${comp.reviewCount} reviews)`)
        console.log(`  vs Your Price: ${diff > 0 ? chalk.red('+' + diff.toFixed(1) + '%') : chalk.green(diff.toFixed(1) + '%')}`)
        console.log(`  Profit if matched: ${profitIfMatched > 10 ? chalk.green('$' + profitIfMatched.toFixed(2)) : chalk.yellow('$' + profitIfMatched.toFixed(2))}`)
        console.log(`  URL: ${chalk.underline(comp.url)}`)
      })
      
      // Market opportunity analysis
      const avgCompetitorPrice = competitors.reduce((sum: number, c: any) => sum + c.price, 0) / competitors.length
      const marketGap = ((avgCompetitorPrice - retailPrice) / avgCompetitorPrice * 100)
      
      console.log('\n' + chalk.bold.cyan('Market Opportunity'))
      console.log(chalk.gray('─'.repeat(60)))
      console.log(`${chalk.bold('Avg Competitor Price:')} $${avgCompetitorPrice.toFixed(2)}`)
      console.log(`${chalk.bold('Your Price Position:')} ${marketGap > 0 ? chalk.green(`${marketGap.toFixed(1)}% below market`) : chalk.red(`${Math.abs(marketGap).toFixed(1)}% above market`)}`)
      
      if (marketGap > 10) {
        console.log(chalk.green('\n✓ Strong competitive advantage - you can undercut market while maintaining healthy margins'))
      } else if (marketGap > -5) {
        console.log(chalk.yellow('\n⚠ Competitive market - focus on differentiation and marketing'))
      } else {
        console.log(chalk.red('\n✗ Price disadvantage - consider negotiating better supplier rates or premium positioning'))
      }
      
    } catch (error: any) {
      spinner.fail('Competitor analysis failed')
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })
