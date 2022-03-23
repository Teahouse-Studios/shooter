export type DefinitionSource = 'mcwzh' | 'bedw' | 'microsoft' | 'translatewiki'

export interface Entry {
  term: string
  translation: {
    text: string
    partOfSpeech: string | 'unknown'
    source: DefinitionSource
  }[]
  links: {
    site: string
    id: string // this can be any unique id, no matter whether it's a string or number
    url: string
  }[]
  tags: string[]
  extract: ExtractResult[]
}

export interface ExtractResult {
  title: string
  extract: string
  language: 'en' | 'zh'
  notFound?: boolean
  source?: DefinitionSource
}

export interface WikiData {
  autolink: Entry[]
  extract: ExtractResult[]
}
