import { bundleMDX } from 'mdx-bundler'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import { createHash } from 'crypto'
import readingTime from 'reading-time'
import getAllFilesRecursively from './utils/files'
import { toISOString } from './utils/formatDate'
import type { TocHeading } from './remark-toc-headings'

// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkExtractFrontmatter from './remark-extract-frontmatter'
import remarkCodeTitles from './remark-code-title'
import remarkTocHeadings from './remark-toc-headings'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'

const root = process.cwd()

// 简单的基于内容的 MDX 编译缓存
const MDX_CACHE_VERSION = 'v1'
const getMdxCacheDir = (type: string): string => path.join(root, '.next', 'cache', 'mdx', type)
const getMdxCacheFile = (type: string, slug: string): string =>
  path.join(getMdxCacheDir(type), `${slug}.json`)

interface MdxCache {
  sourceHash: string
  code: string
  frontmatter: any
  toc: TocHeading[]
  generatedAt: string
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function hashContent(source: string): string {
  return createHash('sha256').update(source).update(MDX_CACHE_VERSION).digest('hex')
}

function readMdxCache(type: string, slug: string): MdxCache | null {
  try {
    const file = getMdxCacheFile(type, slug)
    if (!fs.existsSync(file)) return null
    const raw = fs.readFileSync(file, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeMdxCache(type: string, slug: string, payload: MdxCache): void {
  try {
    const dir = getMdxCacheDir(type)
    ensureDir(dir)
    const file = getMdxCacheFile(type, slug)
    fs.writeFileSync(file, JSON.stringify(payload))
  } catch {
    // 忽略缓存写入失败
  }
}

/**
 * 获取指定类型的所有文件路径
 */
export function getFiles(type: string): string[] {
  const prefixPaths = path.join(root, 'data', type)
  const files = getAllFilesRecursively(prefixPaths)
  // Only want to return blog/path and ignore root, replace is needed to work on Windows
  return files.map((file) => file.slice(prefixPaths.length + 1).replace(/\\/g, '/'))
}

/**
 * 格式化 slug，移除文件扩展名
 */
export function formatSlug(slug: string): string {
  return slug.replace(/\.(mdx|md)/, '')
}

/**
 * 日期降序排序函数
 */
export function dateSortDesc(a: string | Date, b: string | Date): number {
  if (a > b) return -1
  if (a < b) return 1
  return 0
}

export interface FrontMatter {
  [key: string]: any
  title?: string
  date: string
  tags?: string[]
  draft?: boolean
  summary?: string
  slug?: string | null
  fileName?: string
  readingTime?: ReturnType<typeof readingTime>
}

export interface MdxFileData {
  mdxSource: string
  toc: TocHeading[]
  frontMatter: FrontMatter
}

/**
 * 根据 slug 获取 MDX 文件内容和元数据
 */
export async function getFileBySlug(type: string, slug: string): Promise<MdxFileData> {
  const mdxPath = path.join(root, 'data', type, `${slug}.mdx`)
  const mdPath = path.join(root, 'data', type, `${slug}.md`)
  const source = fs.existsSync(mdxPath)
    ? fs.readFileSync(mdxPath, 'utf8')
    : fs.readFileSync(mdPath, 'utf8')

  // 读取缓存（命中则跳过 bundleMDX）
  const sourceHash = hashContent(source)
  const cached = readMdxCache(type, slug)
  if (cached && cached.sourceHash === sourceHash && cached.code && cached.frontmatter) {
    const code = cached.code
    const frontmatter = cached.frontmatter
    const toc = Array.isArray(cached.toc) ? cached.toc : []

    return {
      mdxSource: code,
      toc,
      frontMatter: {
        readingTime: readingTime(code),
        slug: slug || null,
        fileName: fs.existsSync(mdxPath) ? `${slug}.mdx` : `${slug}.md`,
        ...frontmatter,
        date: toISOString(frontmatter.date) || frontmatter.date,
        _fromCache: true,
      },
    }
  }

  // https://github.com/kentcdodds/mdx-bundler#nextjs-esbuild-enoent
  if (process.platform === 'win32') {
    process.env.ESBUILD_BINARY_PATH = path.join(root, 'node_modules', 'esbuild', 'esbuild.exe')
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(root, 'node_modules', 'esbuild', 'bin', 'esbuild')
  }

  const toc: TocHeading[] = []

  const { code, frontmatter } = await bundleMDX({
    source,
    // mdx imports can be automatically source from the components directory
    cwd: path.join(root, 'components'),
    mdxOptions(options, _frontmatter) {
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        remarkExtractFrontmatter,
        [remarkTocHeadings, { exportRef: toc }],
        remarkGfm,
        remarkCodeTitles,
        remarkMath,
        // remarkImgToJsx, // Temporarily disabled
      ]
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        rehypeAutolinkHeadings,
        rehypeKatex,
        [rehypeCitation, { path: path.join(root, 'data') }],
        [rehypePrismPlus, { ignoreMissing: true }],
        rehypePresetMinify,
      ]
      return options
    },
    esbuildOptions: (options) => {
      options.loader = {
        ...options.loader,
        '.js': 'jsx',
      }
      return options
    },
  })

  // 写入缓存
  writeMdxCache(type, slug, {
    sourceHash,
    code,
    frontmatter,
    toc,
    generatedAt: new Date().toISOString(),
  })

  return {
    mdxSource: code,
    toc,
    frontMatter: {
      readingTime: readingTime(code),
      slug: slug || null,
      fileName: fs.existsSync(mdxPath) ? `${slug}.mdx` : `${slug}.md`,
      ...frontmatter,
      date: toISOString(frontmatter.date) || frontmatter.date,
    },
  }
}

/**
 * 获取文件夹中所有文件的 frontmatter
 */
export async function getAllFilesFrontMatter(folder: string): Promise<FrontMatter[]> {
  const prefixPaths = path.join(root, 'data', folder)

  const files = getAllFilesRecursively(prefixPaths)

  const allFrontMatter: FrontMatter[] = []

  files.forEach((file) => {
    // Replace is needed to work on Windows
    const fileName = file.slice(prefixPaths.length + 1).replace(/\\/g, '/')
    // Remove Unexpected File
    if (path.extname(fileName) !== '.md' && path.extname(fileName) !== '.mdx') {
      return
    }
    const source = fs.readFileSync(file, 'utf8')
    const { data: frontmatter } = matter(source)
    if (frontmatter.draft !== true) {
      allFrontMatter.push({
        ...frontmatter,
        slug: formatSlug(fileName),
        date: toISOString(frontmatter.date) || frontmatter.date,
      })
    }
  })

  return allFrontMatter.sort((a, b) => dateSortDesc(a.date, b.date))
}
