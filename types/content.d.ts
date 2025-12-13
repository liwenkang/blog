// Base content models for gradual TypeScript adoption
// Keeps project JS-compatible while enabling type usage in TS/JS via JSDoc

export interface TagSummary {
  name: string
  slug: string
  count: number
}

export interface AuthorMeta {
  name: string
  avatar?: string
  bio?: string
  twitter?: string
  github?: string
  website?: string
}

export interface PostFrontmatter {
  title: string
  date: string // ISO string
  tags?: string[]
  draft?: boolean
  summary?: string
  images?: string[]
  authors?: string[]
}

export interface PostItem {
  slug: string
  filePath: string
  frontMatter: PostFrontmatter
  readingTime?: {
    text: string
    minutes: number
    time: number
    words: number
  }
}

export interface SearchIndexItem {
  id: string
  slug: string
  title: string
  summary?: string
  tags?: string[]
  content?: string
  date: string
  readingTime: string
  url: string
  searchText: string
}

export interface SiteMetadata {
  title: string
  author: AuthorMeta
  headerTitle: string
  description: string
  language: string
  theme: 'system' | 'dark' | 'light'
  siteUrl: string
  siteRepo?: string
  socialBanner?: string
}
