#!/usr/bin/env ts-node

import fs from 'fs'
import path from 'path'
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

console.log('🔍 分析项目依赖必要性...\n')

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface PackageUsageInfo {
  file: string
  import: string
}

// 1. 读取 package.json
console.log('📦 当前项目依赖:')
let packageJson: PackageJson
try {
  packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }

  console.log(`  📊 总依赖数: ${Object.keys(allDeps).length}`)
  console.log(`  🔧 生产依赖: ${Object.keys(packageJson.dependencies || {}).length}`)
  console.log(`  🛠️ 开发依赖: ${Object.keys(packageJson.devDependencies || {}).length}\n`)
} catch {
  console.log('❌ 无法读取 package.json')
  process.exit(1)
}

// 2. 检查代码中的实际使用情况
console.log('🔍 检查代码中的实际使用情况...')

const directoriesToSearch = ['pages', 'components', 'lib', 'styles', 'scripts', '.']

const extensionsToCheck = ['.js', '.jsx', '.ts', '.tsx', '.mdx']

const importPatterns = [
  // CommonJS patterns
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /require\s*\(\s*['"]@?([^@'"]+)\/([^'"]+)['"]\s*\)/g,
  // ES6 patterns
  /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
  /import\s+['"]([^'"]+)['"]/g,
  // Dynamic imports
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
]

const usedPackages = new Set<string>()
const packageUsage: Record<string, PackageUsageInfo[]> = {}

function searchInFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    importPatterns.forEach((pattern) => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1] || match[0]

        // 处理相对路径
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          continue
        }

        // 处理 @ 符号开头的作用域包
        if (importPath.startsWith('@')) {
          const parts = importPath.split('/')
          if (parts.length >= 2) {
            const scopePackage = `${parts[0]}/${parts[1]}`
            usedPackages.add(scopePackage)
            packageUsage[scopePackage] = packageUsage[scopePackage] || []
            packageUsage[scopePackage].push({
              file: filePath,
              import: match[0],
            })
          }
        } else {
          // 处理普通包
          const packageName = importPath.split('/')[0]
          usedPackages.add(packageName)
          packageUsage[packageName] = packageUsage[packageName] || []
          packageUsage[packageName].push({
            file: filePath,
            import: match[0],
          })
        }
      }
    })
  } catch {
    // 忽略读取错误
  }
}

function searchDirectory(dir: string) {
  if (!fs.existsSync(dir)) return

  const items = fs.readdirSync(dir)

  items.forEach((item) => {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      searchDirectory(fullPath)
    } else if (stat.isFile()) {
      const ext = path.extname(item)
      if (extensionsToCheck.includes(ext)) {
        searchInFile(fullPath)
      }
    }
  })
}

// 搜索所有相关目录
directoriesToSearch.forEach((dir) => {
  if (fs.existsSync(dir)) {
    searchDirectory(dir)
  }
})

// 3. 特殊检查：配置文件中的依赖
console.log('🔧 检查配置文件中的依赖使用...')

const configFiles = [
  'next.config.js',
  'jest.config.js',
  'eslint.config.js',
  'tsconfig.json',
  'tailwind.config.js',
  '.babelrc',
  'postcss.config.js',
]

configFiles.forEach((configFile) => {
  if (fs.existsSync(configFile)) {
    try {
      const content = fs.readFileSync(configFile, 'utf8')

      // 检查 Next.js 插件
      if (content.includes('@sentry/nextjs')) {
        usedPackages.add('@sentry/nextjs')
        packageUsage['@sentry/nextjs'] = packageUsage['@sentry/nextjs'] || []
        packageUsage['@sentry/nextjs'].push({
          file: configFile,
          import: 'Next.js plugin',
        })
      }

      // 检查 TypeScript
      if (content.includes('typescript') || content.includes('tsconfig')) {
        usedPackages.add('typescript')
        packageUsage['typescript'] = packageUsage['typescript'] || []
        packageUsage['typescript'].push({
          file: configFile,
          import: 'TypeScript configuration',
        })
      }
    } catch {
      // 忽略读取错误
    }
  }
})

// 4. 分析结果
console.log('\n📊 依赖使用分析结果:\n')

const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}

const unusedPackages: string[] = []
const usedPackagesList: string[] = []

Object.keys(allDeps).forEach((pkg) => {
  if (
    usedPackages.has(pkg) ||
    usedPackages.has(`@${pkg}`) ||
    (pkg.startsWith('@') && usedPackages.has(pkg.split('/')[0] + '/' + pkg.split('/')[1]))
  ) {
    usedPackagesList.push(pkg)
  } else {
    unusedPackages.push(pkg)
  }
})

console.log(`✅ 已使用的依赖 (${usedPackagesList.length}):`)
usedPackagesList.forEach((pkg) => {
  console.log(`  - ${pkg}`)
})

console.log(`\n❌ 未使用的依赖 (${unusedPackages.length}):`)
unusedPackages.forEach((pkg) => {
  console.log(`  - ${pkg}`)
})

console.log('\n📋 分析完成')
