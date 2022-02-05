import fs from 'fs-extra'
import { Entry, ExtractResult } from './types'

export default async function combine(): Promise<Entry[]> {
  const autolink = {
    mcwzh: JSON.parse(
      (await fs.readFile(
        './generated/autolink_mcwzh.json'
      )) as unknown as string
    ) as Entry[],
    bedw: JSON.parse(
      (await fs.readFile('./generated/autolink_bedw.json')) as unknown as string
    ) as Entry[],
  }
  const extract = {
    mcwzh: JSON.parse(
      (await fs.readFile('./generated/extract_mcwzh.json')) as unknown as string
    ) as ExtractResult[],
    bedw: JSON.parse(
      (await fs.readFile('./generated/extract_bedw.json')) as unknown as string
    ) as ExtractResult[],
  }
  for (const i of autolink.mcwzh) {
    // find the corresponding entry in extract.mcwzh
    const entry = extract.mcwzh.find(
      (e) => e.title === i.links[0].id.split('#')[0]
    )
    if (entry) {
      i.extract?.push({
        ...entry,
        source: 'mcwzh',
      })
    } else {
      i.extract.push({
        title: i.translation[0].text,
        language: 'zh',
        extract: '',
        notFound: true,
        source: 'mcwzh',
      })
    }
  }
  const entries = [...autolink.mcwzh, ...autolink.bedw]
  let result: Entry[] = []
  for (const i of entries) {
    // merge entries with same term
    const index = result.findIndex((e) => e.term === i.term)
    if (index === -1) {
      result.push(i)
    } else {
      result[index].translation = [
        ...result[index].translation,
        ...i.translation,
      ]
      result[index].extract = [...result[index].extract, ...i.extract]
      result[index].links = [...result[index].links, ...i.links]
      result[index].tags = [...result[index].tags, ...i.tags]
    }
  }
  return result
}
