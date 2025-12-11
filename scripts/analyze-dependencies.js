#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { logger } = require('./utils/script-logger')

// unify console outputs through script logger
console.log = function (...args) {
  return logger.info(args[0], typeof args[1] === 'object' ? args[1] : {})
}
console.warn = function (...args) {
  return logger.warn(args[0], typeof args[1] === 'object' ? args[1] : {})
}
console.error = function (...args) {
  const [msg, maybeError, meta] = args
  if (maybeError instanceof Error) {
    return logger.error(msg, maybeError, typeof meta === 'object' ? meta : {})
  }
  return logger.error(msg, null, typeof maybeError === 'object' ? maybeError : {})
}

console.log('🔍 分析项目依赖必要性...\n')

// 1. 读取 package.json
console.log('📦 当前项目依赖:')
let packageJson
try {
  packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }

  console.log(`  📊 总依赖数: ${Object.keys(allDeps).length}`)
  console.log(`  🔧 生产依赖: ${Object.keys(packageJson.dependencies || {}).length}`)
  console.log(`  🛠️ 开发依赖: ${Object.keys(packageJson.devDependencies || {}).length}\n`)
} catch (error) {
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

const usedPackages = new Set()
const packageUsage = {}

function searchInFile(filePath) {
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
  } catch (error) {
    // 忽略读取错误
  }
}

function searchDirectory(dir) {
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
    } catch (error) {
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

const unusedPackages = []
const usedPackagesList = []

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
  const version = allDeps[pkg]
  const isDev = packageJson.devDependencies && packageJson.devDependencies[pkg]
  const type = isDev ? '🛠️' : '📦'
  const usage = packageUsage[pkg] || packageUsage[`@${pkg}`]
  const usageCount = usage ? usage.length : 0

  console.log(`  ${type} ${pkg}@${version} (${usageCount} 次使用)`)

  if (usage && usage.length > 0 && usage.length <= 3) {
    usage.slice(0, 3).forEach((u) => {
      console.log(`    📄 ${u.file}: ${u.import}`)
    })
  }
})

console.log(`\n⚠️ 可能未使用的依赖 (${unusedPackages.length}):`)
unusedPackages.forEach((pkg) => {
  const version = allDeps[pkg]
  const isDev = packageJson.devDependencies && packageJson.devDependencies[pkg]
  const type = isDev ? '🛠️' : '📦'

  console.log(`  ${type} ${pkg}@${version}`)
})

// 5. 特殊分析：某些包的间接依赖
console.log('\n🔍 特殊依赖分析:')

const specialPackages = {
  punycode: {
    reason: 'Node.js 内置模块的废弃警告',
    status: '❌ 应该移除',
    action: 'npm uninstall punycode',
  },
  '@types/react': {
    reason: 'React 19 类型定义已包含在 react 包中',
    status: '⚠️ 可能不需要',
    action: '检查是否可以移除',
  },
  '@types/react-dom': {
    reason: 'React 19 DOM 类型定义已包含在 react-dom 包中',
    status: '⚠️ 可能不需要',
    action: '检查是否可以移除',
  },
  autoprefixer: {
    reason: 'PostCSS 自动前缀插件',
    status: '✅ Tailwind CSS 依赖',
    action: '保留',
  },
  postcss: {
    reason: 'CSS 处理工具',
    status: '✅ Tailwind CSS 依赖',
    action: '保留',
  },
}

Object.entries(specialPackages).forEach(([pkg, info]) => {
  if (allDeps[pkg]) {
    console.log(`\n📦 ${pkg}:`)
    console.log(`  ${info.status} ${info.reason}`)
    console.log(`  💡 建议: ${info.action}`)
  }
})

// 6. 总结和建议
console.log('\n📋 总结和建议:')

console.log(`\n📊 依赖统计:`)
console.log(`  总依赖数: ${Object.keys(allDeps).length}`)
console.log(
  `  已使用: ${usedPackagesList.length} (${((usedPackagesList.length / Object.keys(allDeps).length) * 100).toFixed(1)}%)`
)
console.log(
  `  未使用: ${unusedPackages.length} (${((unusedPackages.length / Object.keys(allDeps).length) * 100).toFixed(1)}%)`
)

if (unusedPackages.length > 0) {
  console.log(`\n🎯 可以安全移除的依赖:`)
  const safeToRemove = unusedPackages.filter(
    (pkg) => !['@types/node', 'typescript'].includes(pkg) // 保留关键依赖
  )

  if (safeToRemove.length > 0) {
    console.log(`\n npm uninstall ${safeToRemove.join(' ')}`)
  }

  console.log(`\n⚠️ 需要手动检查的依赖:`)
  const needsReview = unusedPackages.filter((pkg) => ['@types/node', 'typescript'].includes(pkg))
  needsReview.forEach((pkg) => {
    console.log(`  📦 ${pkg}: 请确认是否在配置或构建过程中使用`)
  })
}

console.log(`\n💡 优化建议:`)
console.log(`1. 移除未使用的依赖以减少包大小`)
console.log(`2. 检查重复的类型定义包（React 19 已包含类型）`)
console.log(`3. 定期运行 npm audit 检查安全问题`)
console.log(`4. 使用 npm outdated 检查过时依赖`)

console.log('\n✅ 依赖分析完成！')
