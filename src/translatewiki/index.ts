import fetch from '@adobe/node-fetch-retry'
import chalk from 'chalk'
import { Entry } from '../types'

export default async function getTranslatewikiGlossary(
  link = 'https://translatewiki.net/w/api.php?action=query&format=json&prop=revisions&rvprop=content&formatversion=2&titles=Portal:Zh/terminology.json'
): Promise<Entry[]> {
  console.timeLog(chalk.blue('info') + ' translatewiki done in')
  const res = await fetch(link)
  console.log(chalk.green('success') + ' Fetched data from translatewiki.')
  const obj = (await res.json()) as any
  const responseJson = obj.query.pages[0].revisions[0].content as string
  const resTree = JSON.parse(responseJson)
  const result: Entry[] = []
  for (const i in resTree) {
    if (i === '@editnotice' || resTree[i].hasOwnProperty('@alias')) {
      continue
    }
    const term = i
    const translation = resTree[i].translation.replace(
      /\{\{tgzh\|\$VARIANT\|(.*?)\|.*\}\}/,
      '$1'
    ).replace(/（.*）/, '')
    const dived = translation.split('、')
    const translations = dived.map((t: string) => {return {text: t, partOfSpeech: 'unknown', source: 'translatewiki'}})
    const entry: Entry = {
      term,
      translation: [
        translations
      ],
      links: [
        {
          site: 'translatewiki',
          id: term,
          url: `https://translatewiki.net/wiki/Portal:Zh/Glossary#${term}`,
        },
      ],
      tags: [`it.translatewiki`],
      extract: [],
    }
    result.push(entry)
  }

  console.timeLog(chalk.blue('info') + ' translatewiki done in')
  return result
}
