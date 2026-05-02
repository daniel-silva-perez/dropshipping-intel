import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { initDb } from '../db/schema'

export const listCommand = new Command('list')
  .description('List tracked products and analytics')
  .option('-s, --source <source>', 'Filter by source platform')
  .option('-c, --category <category>', 'Filter by category')
  .option('-l, --limit <limit>', 'Limit results', '50')
  .option('--tracked-only', 'Show only tracked products', false)
  .action(async (options) => {
    const db = initDb('./data/dropshipping.db')
    const spinner = ora('Loading products...').start()
    
    try {
      let query = 'SELECT * FROM products WHERE 1=1'
      const params: any[] = []
      
      if (options.source) {
        query += ' AND source = ?'
        params.push(options.source)
      }
      
      if (options.category) {
        query += ' AND category = ?'
        params.push(options.category)
      }
      
      if (options.trackedOnly) {
        query += ' AND id IN (SELECT product_id FROM tracking)'
      }
      
      query += ' ORDER BY updated_at DESC LIMIT ?'
      params.push(parseInt(options.limit))
      
      const products = await new Promise<any[]>((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err)
          else resolve(rows as any[])
        })
      })
      
      spinner.succeed(`Found ${products.length} products`)
      
      // Simple table output
      console.log('\n' + chalk.bold.cyan('Products'))
      console.log(chalk.gray('═'.repeat(90)))
      console.log(
        `${chalk.bold('ID'.padEnd(10))} ${chalk.bold('Name'.padEnd(40))} ${chalk.bold('Price'.padEnd(10))} ${chalk.bold('Rating'.padEnd(8))} ${chalk.bold('Orders'.padEnd(8))} ${chalk.bold('Source')}`
      )
      console.log(chalk.gray('─'.repeat(90)))
      
      products.forEach((p: any) => {
        const name = p.name.length > 37 ? p.name.slice(0, 37) + '...' : p.name
        console.log(
          `${p.id.slice(0, 8).padEnd(10)} ${name.padEnd(40)} ${('$' + p.price.toFixed(2)).padEnd(10)} ${(p.rating ? p.rating.toFixed(1) : '-').padEnd(8)} ${(p.orders_count || 0).toString().padEnd(8)} ${p.source}`
        )
      })
      
    } catch (error: any) {
      spinner.fail('Failed to list products')
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })
