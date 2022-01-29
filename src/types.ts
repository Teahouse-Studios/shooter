export interface AutolinkResult {
  term: string
  translation: string
  wikiPage: string
  category: string
}

export interface ExtractResult {
  title: string
  extract: string
  thumbnail: {
    source: string
    width: number
    height: number
  }
  notFound?: boolean
}
