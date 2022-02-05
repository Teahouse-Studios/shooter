import fetch from '@adobe/node-fetch-retry'
import chalk from 'chalk'
import { Entry } from '../types'

export async function autolink(
  moduleName: string,
  apiUrl: string,
  sitename: string,
  articleUrl: string,
  simple = true,
  wikiPagePrefix = ''
): Promise<Entry[]> {
  let res: Entry[]
  if (simple) {
    res = await getSimple(moduleName, apiUrl)
  } else {
    res = await getComplex(moduleName, apiUrl)
  }

  async function getSimple(
    moduleName: string,
    apiUrl: string
  ): Promise<Entry[]> {
    const al = await getAutolinkObject(moduleName, apiUrl)
    if ('error' in al) {
      console.log(
        `${chalk.yellow(
          'missing'
        )} Can not find Module:Autolink/${chalk.underline(
          moduleName
        )} from ${chalk.gray(apiUrl)}.`
      )
      return []
    }
    const res: Entry[] = []
    for (const key in al) {
      const term = key
      const val = al[key] as string
      const translation = val.split('|')[1] || val
      const wikiPage = wikiPagePrefix + val.split('|')[0]
      res.push({
        term,
        translation: [{ text: translation, partOfSpeech: 'unknown' }],
        links: [
          {
            site: sitename,
            id: wikiPage,
            url: encodeURI(articleUrl + wikiPage),
          },
        ],
        tags: [`${sitename}.${moduleName}`],
        extract: [],
      })
    }
    return res
  }

  async function getComplex(
    moduleName: string,
    apiUrl: string
  ): Promise<Entry[]> {
    const al = await getAutolinkObject(moduleName, apiUrl)
    if ('error' in al) {
      console.log(
        `${chalk.yellow(
          'missing'
        )} Can not find Module:Autolink/${chalk.underline(
          moduleName
        )} from ${chalk.gray(apiUrl)}.`
      )
      return []
    }
    const res: Entry[] = []
    for (const cat in al) {
      for (const key in al[cat]) {
        const term = key
        const val = al[cat][key] as string
        const translation = val.split('|')[1] || val
        const wikiPage = wikiPagePrefix + val.split('|')[0]
        res.push({
          term,
          translation: [{ text: translation, partOfSpeech: 'unknown' }],
          links: [
            {
              site: 'mcwzh',
              id: wikiPage,
              url: `https://minecraft.fandom.com/zh/wiki/${encodeURIComponent(
                wikiPage
              )}`,
            },
          ],
          tags: [`${sitename}.${moduleName}.${cat.replace('Sprite', '')}`],
          extract: [],
        })
      }
    }
    return res
  }

  console.log(
    `${chalk.green('success')} Fetched Module:Autolink/${chalk.underline(
      moduleName
    )} from ${apiUrl}.`
  )
  return res
}

/**
 * Get the JavaScript object of specified MediaWiki Scribunto Lua module.
 * @param moduleName The name of the module page without "Module:Autolink/".
 * @param apiUrl The URL of the MediaWiki api.php.
 * @returns The JavaScript object of the module.
 */
async function getAutolinkObject(
  moduleName: string,
  apiUrl: string
): Promise<any> {
  const lua = await fetch(
    `${apiUrl}?action=query&prop=revisions&rvslots=*&rvprop=content&formatversion=2&format=json&titles=Module:Autolink/${moduleName}`
  )
  const res = (await lua.json()) as any // defaults to unknown, which is unusable
  if (res.query.pages[0].missing) {
    return { error: 'Page not found' }
  }
  const txt = res.query.pages[0].revisions[0].slots.main.content
  const rawJson = txt
    .replace(/return /, '') // remove return statement
    .replace(/\[|\]/g, '') // remove the brackets
    .replace(/'/g, '"') // replace single quotes with double quotes
    .replace(/--(.*)/g, '') // remove comments
    .replace(/=/g, ':') // replace the = with :
    .replace(/(\,)(?=\s*})/g, '') // remove trailing commas
  const parsed = JSON.parse(rawJson)
  return parsed
}
