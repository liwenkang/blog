#!/usr/bin/env ts-node

import fs from 'node:fs'
import path from 'node:path'
import inquirer from 'inquirer'
import dedent from 'dedent'
import { logger } from './utils/script-logger.js'

// unify console outputs through script logger
console.log = function (...args: any[]) {
  return logger.info(args[0], typeof args[1] === 'object' ? args[1] : {})
}
console.warn = function (...args: any[]) {
  return logger.warn(args[0], typeof args[1] === 'object' ? args[1] : {})
}
console.error = function (...args: any[]) {
  const [msg, maybeError, meta] = args
  if (maybeError instanceof Error) {
    return logger.error(msg, maybeError, typeof meta === 'object' ? meta : {})
  }
  return logger.error(msg, null, typeof maybeError === 'object' ? maybeError : {})
}

const root = process.cwd()

const getAuthors = (): string[] => {
  const authorPath = path.join(root, 'data', 'authors')
  const authorList = fs.readdirSync(authorPath).map((filename) => path.parse(filename).name)
  return authorList
}

const getLayouts = (): string[] => {
  const layoutPath = path.join(root, 'layouts')
  const layoutList = fs
    .readdirSync(layoutPath)
    .map((filename) => path.parse(filename).name)
    .filter((file) => file.toLowerCase().includes('post'))
  return layoutList
}

interface Answers {
  title: string
  extension: string
  authors: string[]
  summary: string
  draft: string
  tags: string
  layout: string
  canonicalUrl: string
}

const genFrontMatter = (answers: Answers): string => {
  // 使用当前时间生成文章日期
  const now = new Date()
  const date = [
    now.getFullYear(),
    ('0' + (now.getMonth() + 1)).slice(-2),
    ('0' + now.getDate()).slice(-2),
  ].join('-')
  const tagArray = answers.tags.split(',')
  tagArray.forEach((tag, index) => (tagArray[index] = tag.trim()))
  const tags = "'" + tagArray.join("','") + "'"
  const authorArray = answers.authors.length > 0 ? "'" + answers.authors.join("','") + "'" : ''

  let frontMatter = dedent`---
  title: ${answers.title ? answers.title : 'Untitled'}
  date: '${date}'
  tags: [${answers.tags ? tags : ''}]
  draft: ${answers.draft === 'yes'}
  summary: ${answers.summary ? answers.summary : ' '}
  images: []
  layout: ${answers.layout}
  canonicalUrl: ${answers.canonicalUrl}
  `

  if (answers.authors.length > 0) {
    frontMatter = frontMatter + '\n' + `authors: [${authorArray}]`
  }

  frontMatter = frontMatter + '\n---'

  return frontMatter
}

// Main execution
try {
  const answers = await inquirer.prompt<Answers>([
    {
      name: 'title',
      message: 'Enter post title:',
      type: 'input',
    },
    {
      name: 'extension',
      message: 'Choose post extension:',
      type: 'list',
      choices: ['mdx', 'md'],
    },
    {
      name: 'authors',
      message: 'Choose authors:',
      type: 'checkbox',
      choices: getAuthors,
    },
    {
      name: 'summary',
      message: 'Enter post summary:',
      type: 'input',
    },
    {
      name: 'draft',
      message: 'Set post as draft?',
      type: 'list',
      choices: ['yes', 'no'],
    },
    {
      name: 'tags',
      message: 'Any Tags? Separate them with , or leave empty if no tags.',
      type: 'input',
    },
    {
      name: 'layout',
      message: 'Select layout',
      type: 'list',
      choices: getLayouts,
    },
    {
      name: 'canonicalUrl',
      message: 'Enter canonical url:',
      type: 'input',
    },
  ])

  // Remove special characters and replace space with -
  const fileName = answers.title
    .toLowerCase()
    .replaceAll(/[^a-zA-Z0-9 ]/g, '')
    .replaceAll(' ', '-')
    .replaceAll(/-+/g, '-')
  const frontMatter = genFrontMatter(answers)
  if (!fs.existsSync('data/blog')) fs.mkdirSync('data/blog', { recursive: true })
  const filePath = `data/blog/${fileName || 'untitled'}.${answers.extension || 'md'}`
  fs.writeFileSync(filePath, frontMatter, { flag: 'wx' })
  console.log(`Blog post generated successfully at ${filePath}`)
} catch (error: any) {
  if (error.isTtyError) {
    console.log("Prompt couldn't be rendered in the current environment")
  } else if (error.code === 'EEXIST') {
    console.error('File already exists!')
  } else {
    console.error('Something went wrong:', error.message)
  }
}
