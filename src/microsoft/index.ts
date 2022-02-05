import fetch from '@adobe/node-fetch-retry'
import { Entry } from '../types'
import { writeFile } from 'fs'
import { JSDOM } from 'jsdom'

writeFile(
  'generated/microsoft.json',
  JSON.stringify(await getMicrosoftGlossary()),
  () => {}
)

export default async function getMicrosoftGlossary(
  link = 'https://www.microsoft.com/zh-cn/language/Terminology_Filter?&langCode=zh-CN&langID=124'
): Promise<Entry[]> {
  const terms = await fetch(link, {
    retryOptions: { socketTimeout: 999999999999999999999 },
  })
  console.log('response')
  const results = new JSDOM(await terms.text()).window.document
  console.log('xml')
  const resTree = new JSDOM(results.querySelector('#MTCResults')!.textContent!)
    .window.document
  const entries = resTree.querySelectorAll('termEntry')
  const glossary: Entry[] = []
  entries.forEach((entry) => {
    const en = entry.querySelector('langSet[xml:lang="en-US"]')!
    const desc = en.querySelector('descrip')!.textContent!
    const enTermGrp = en.querySelector('termGrp')!
    const enTerm = enTermGrp.querySelector('term')!
    const termId = enTerm.getAttribute('id')!
    const termEnglish = enTerm.textContent!
    const partOfSpeech = enTermGrp.querySelector(
      'termNote[type="partOfSpeech"]'
    )!.textContent!
    const termChinese = entry.querySelector('langSet[xml:lang="zh-CN"] term')!
      .textContent!

    glossary.push({
      term: termEnglish,
      translation: [{ text: termChinese, partOfSpeech }],
      links: [
        {
          site: 'microsoft',
          id: termId,
          url: encodeURI(
            `https://www.microsoft.com/zh-cn/language/Search?&searchTerm=${termEnglish}&langID=124&Source=true&productid=0`
          ),
        },
      ],
      tags: [],
      extract: [
        {
          title: termEnglish,
          extract: desc,
          language: 'en',
          source: 'microsoft',
        },
      ],
    })
  })

  return glossary
}
