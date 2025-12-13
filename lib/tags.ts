import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import { getFiles } from './mdx'
import kebabCase from './utils/kebabCase'

const root = process.cwd()

export type TagCount = Record<string, number>

interface Frontmatter {
  tags?: string[]
  draft?: boolean
}

/**
 * 获取指定类型的所有标签及其数量
 */
export async function getAllTags(type: string): Promise<TagCount> {
  const files = await getFiles(type)

  const tagCount: TagCount = {}
  files.forEach((file) => {
    const source = fs.readFileSync(path.join(root, 'data', type, file), 'utf8')
    const { data } = matter(source) as { data: Frontmatter }

    if (data.tags && data.draft !== true) {
      data.tags.forEach((tag) => {
        const formattedTag = kebabCase(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })

  return tagCount
}
