import chalk from 'chalk'
import { Entry, ExtractResult, WikiData } from '../types'
import { autolink } from './autolink.js'
import extractPages from './extract.js'

export async function getDataFromMCWZH(
  apiUrl: string = 'https://minecraft.fandom.com/zh/api.php',
  sitename: string = 'mcwzh',
  articleUrl: string = 'https://minecraft.fandom.com/zh/wiki/'
): Promise<WikiData> {
  console.time(chalk.blue('info') + ' MCWZH Done in')
  const [block, exclusive, item, other, dungeons, earth] = await Promise.all([
    autolink('Block', apiUrl, sitename, articleUrl),
    autolink('Exclusive', apiUrl, sitename, articleUrl),
    autolink('Item', apiUrl, sitename, articleUrl),
    autolink('Other', apiUrl, sitename, articleUrl, false),
    autolink('Dungeons', apiUrl, sitename, articleUrl, false, 'MCD:'),
    autolink('Earth', apiUrl, sitename, articleUrl, false, 'MCE:'),
  ])
  const autolinkData = Array.prototype.concat(
    block,
    exclusive,
    item,
    other,
    dungeons,
    earth
  )
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
  console.timeLog(chalk.blue('info') + ' MCWZH Done in')
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

  return {
    autolink: autolinkData,
    extract: result,
  }
}

export async function getDataFromBEDW(
  apiUrl: string = 'https://wiki.bedev.cn/api.php',
  sitename: string = 'bedw',
  articleUrl: string = 'https://wiki.bedev.cn/'
): Promise<WikiData> {
  console.time(chalk.blue('info') + ' BEDW Done in')
  let [other, gloassary] = await Promise.all([
    autolink('Other', apiUrl, sitename, articleUrl, false),
    autolink('Glossary', apiUrl, sitename, articleUrl, false),
  ])
  const autolinkData = Array.prototype.concat(
    other,
    other.filter(({ tags }) => tags.includes('Other.Vanilla'))
  )
  console.log(`${chalk.green('success')} Autolink completed.`)
  console.timeLog(chalk.blue('info') + ' BEDW Done in')

  return {
    autolink: autolinkData,
    extract: [],
  }
}

async function extractAutolinkData(
  apiUrl: string,
  autolinkData: Entry[]
): Promise<ExtractResult[]> {
  const pageName = autolinkData.map(({ links }) => links[0].id)
  const uniquePageName = [...new Set(pageName)]
  const max = 50
  const requests = []
  for (let i = 0; i < uniquePageName.length; i += max) {
    requests.push(extractPages(uniquePageName.slice(i, i + max), apiUrl))
  }
  const extract = await Promise.all(requests)
  return extract.flat()
}
