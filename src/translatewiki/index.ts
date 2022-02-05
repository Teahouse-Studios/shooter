import fetch from '@adobe/node-fetch-retry'
import chalk from 'chalk'
import { Entry } from '../types'

export default async function translatewikiGlossary(
  link = 'https://translatewiki.net/w/api.php?action=query&format=json&prop=revisions&rvprop=content&titles=Portal:Zh/terminology.json'
): Promise<Entry[]> {
  const res = await fetch(link)
  const obj = await res.json()
}
