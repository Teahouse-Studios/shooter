import fetch from '@adobe/node-fetch-retry'
import chalk from 'chalk'
import { ExtractResult } from '../types'

export default async function extractPages(
  pageName: string[],
  apiUrl: string,
  _continue: any = {}
): Promise<ExtractResult[]> {
  let results: ExtractResult[] = []
  const continueParams =
    _continue !== {}
      ? '&' +
        Object.entries(_continue)
          .map(([key, val]) => `${key}=${encodeURIComponent(val as string)}`)
          .join('&')
      : ''
  const pageHashless = pageName.map((page) => page.split('#')[0])
  const res = await fetch(
    `${apiUrl}?action=query&prop=extracts|pageimages&exchars=200&explaintext=true&exintro=true&formatversion=2&format=json&titles=${pageHashless.join(
      '|'
    )}${continueParams}`
  )
  const json = (await res.json()) as any
  const pages = json.query.pages
  for (const i of pages) {
    if ('missing' in i) {
      results.push({
        title: i.title as string,
        extract: '',
        notFound: true,
        language: 'zh',
      })
      continue
    }
    const extract = (i.extract as string) || ''
    results.push({ title: i.title as string, extract, language: 'zh' })
  }
  if (json.continue) {
    const next = await extractPages(pageName, apiUrl, json.continue)
    results = results.concat(next)
  }
  if ('continue'! in _continue) {
    console.log(
      `${chalk.green('success')} Extracted text and image of ${chalk.underline(
        pageName.join(', ')
      )} from ${apiUrl}.`
    )
  }
  return results
}
