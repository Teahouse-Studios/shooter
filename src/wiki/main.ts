import { writeFile } from 'fs'
import chalk from 'chalk'
import { AutolinkResult, ExtractResult } from '../types'
import { autolink } from './autolink.js'
import { extractPages } from './extract.js'

writeFile(
  './wiki.json',
  JSON.stringify(await getDataFromMCW()) + '\n',
  () => {}
)

export async function getDataFromMCW(
  apiUrl: string = 'https://minecraft.fandom.com/zh/api.php'
): Promise<ExtractResult[]> {
  console.time(chalk.blue('info') + ' Done in')
  const [block, exclusive, item, other, dungeons, earth] = await Promise.all([
    autolink('Block', apiUrl),
    autolink('Exclusive', apiUrl),
    autolink('Item', apiUrl),
    autolink('Other', apiUrl, false),
    autolink('Dungeons', apiUrl, false, 'MCD:'),
    autolink('Earth', apiUrl, false, 'MCE:'),
  ])
  console.log(`${chalk.green('success')} Autolink completed.`)
  const [
    blockExtract,
    exclusiveExtract,
    itemExtract,
    otherExtract,
    dungeonsExtract,
    earthExtract,
  ] = await Promise.all([
    extractAutolinkData(apiUrl, block),
    extractAutolinkData(apiUrl, exclusive),
    extractAutolinkData(apiUrl, item),
    extractAutolinkData(apiUrl, other),
    extractAutolinkData(apiUrl, dungeons),
    extractAutolinkData(apiUrl, earth),
  ])
  console.log(`${chalk.green('success')} Extract completed.`)
  console.timeLog(chalk.blue('info') + ' Done in')
  const final = Array.prototype.concat(
    blockExtract,
    exclusiveExtract,
    itemExtract,
    otherExtract,
    dungeonsExtract,
    earthExtract
  )
  let result: ExtractResult[] = []
  final.forEach((extract) => {
    // merge every object with the same key 'title' to one object
    const index = result.findIndex((item) => item.title === extract.title)
    if (index === -1) {
      result.push(extract)
    } else {
      const e = result[index].extract || ''
      result[index] = {
        ...result[index],
        extract: e + extract.extract,
      }
    }
  })

  return result
}

async function extractAutolinkData(
  apiUrl: string,
  autolinkData: AutolinkResult[]
): Promise<ExtractResult[]> {
  const pageName = autolinkData.map(({ wikiPage }) => wikiPage)
  const uniquePageName = [...new Set(pageName)]
  const max = 50
  const requests = []
  for (let i = 0; i < uniquePageName.length; i += max) {
    requests.push(extractPages(uniquePageName.slice(i, i + max), apiUrl))
  }
  const extract = await Promise.all(requests)
  return extract.flat()
}
