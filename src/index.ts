import { getDataFromMCWZH, getDataFromBEDW } from './wiki/index.js'
import combine from './combine.js'
import chalk from 'chalk'
import { writeFile } from 'fs'
import prettier from 'prettier'

console.time(chalk.blue('info') + ' All done in')

console.log(chalk.gray('[1/3]') + ' Loading data from MCWZH...')
const mcwzh = await getDataFromMCWZH()
await writeFile(
  './generated/autolink_mcwzh.json',
  prettier.format(JSON.stringify(mcwzh.autolink), { parser: 'json' }) + '\n',
  () => {}
)
await writeFile(
  './generated/extract_mcwzh.json',
  prettier.format(JSON.stringify(mcwzh.extract), { parser: 'json' }) + '\n',
  () => {}
)

console.log(chalk.gray('[2/3]') + ' Loading data from BEDW...')
const bedw = await getDataFromBEDW()
await writeFile(
  './generated/autolink_bedw.json',
  prettier.format(JSON.stringify(bedw.autolink), { parser: 'json' }) + '\n',
  () => {}
)
await writeFile(
  './generated/extract_bedw.json',
  prettier.format(JSON.stringify(bedw.extract), { parser: 'json' }) + '\n',
  () => {}
)

console.log(chalk.gray('[3/3]') + ' Combining Data...')
const combined = await combine()
await writeFile(
  './generated/combined.json',
  prettier.format(JSON.stringify(combined), { parser: 'json' }) + '\n',
  () => {}
)

console.timeLog(chalk.blue('info') + ' All done in')
