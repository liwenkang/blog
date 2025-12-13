import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import { getFiles } from './mdx'
import kebabCase from './utils/kebabCase'

const root = process.cwd()

/**
 * @typedef {import('../types/content').TagSummary} TagSummary
 */
/**
 * @param {string} type
 * @returns {Promise<Record<string, number>>}
 */
export async function getAllTags(type) {
  const files = await getFiles(type)

  /** @type {Record<string, number>} */
  let tagCount = {}
  // Iterate through each post, putting all found tags into `tags`
  files.forEach((file) => {
    const source = fs.readFileSync(path.join(root, 'data', type, file), 'utf8')
    const { data } = matter(source)
    /** @type {{ tags?: string[]; draft?: boolean }} */
    const fm = data
    if (fm.tags && fm.draft !== true) {
      fm.tags.forEach((tag) => {
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
