import { Command } from 'commander'
import chalk from 'chalk'
import { searchCommand } from './commands/search'
import { trackCommand } from './commands/track'
import { analyzeCommand } from './commands/analyze'
import { listCommand } from './commands/list'
import { exportCommand } from './commands/export'
import { competitorCommand } from './commands/competitor'
import { initDb } from './db/schema'
import { config } from 'dotenv'

config()

const program = new Command()
  .name('dropship-intel')
  .description('Dropshipping product intelligence CLI')
  .version('1.0.0')
  .option('-d, --database <path>', 'Database path', './data/dropshipping.db')

program.hook('preAction', async (thisCommand) => {
  const opts = thisCommand.opts()
  const db = await initDb(opts.database)
  thisCommand.setOptionValue('db', db)
})

program
  .addCommand(searchCommand)
  .addCommand(trackCommand)
  .addCommand(analyzeCommand)
  .addCommand(listCommand)
  .addCommand(exportCommand)
  .addCommand(competitorCommand)

program.parse()
