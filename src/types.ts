export interface Entry {
  term: string
  translation: string[]
  links: {
    site: string
    page: string
    url: string
  }[]
  tags: string[]
  extract: ExtractResult[]
}

export interface ExtractResult {
  title: string
  extract: string
  notFound?: boolean
  source?: 'mcwzh' | 'bedw'
}

export interface WikiData {
  autolink: Entry[]
  extract: ExtractResult[]
}
