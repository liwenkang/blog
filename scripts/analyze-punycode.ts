#!/usr/bin/env ts-node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
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

console.log('🔍 分析 punycode 废弃警告来源...\n')

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  description?: string
}

// 1. 检查直接的 punycode 依赖
console.log('📦 直接 punycode 依赖:')
try {
  const packageJson: PackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  if (packageJson.dependencies && packageJson.dependencies.punycode) {
    console.log(`  ✅ 直接依赖: punycode@${packageJson.dependencies.punycode}`)
  } else {
    console.log('  ❌ 无直接 punycode 依赖')
  }
} catch {
  console.log('❌ 无法读取 package.json')
}

// 2. 分析依赖树中的 punycode 使用
console.log('\n🌳 依赖树中的 punycode 使用:')

try {
  // 获取完整的依赖树信息
  const result = execSync('npm ls punycode --json', { encoding: 'utf8' })
  const npmData = JSON.parse(result)

  if (npmData.dependencies && npmData.dependencies.punycode) {
    const punycodeDeps = npmData.dependencies.punycode
    console.log(`  📦 punycode@${punycodeDeps.version} (${punycodeDeps.from})`)
    console.log(`  📋 描述: ${punycodeDeps.description}`)
  }
} catch {
  console.log('❌ 无法获取 npm 依赖信息')
}

// 3. 使用 npm 为什么 命令分析
console.log('\n🔍 分析哪些包依赖 punycode:')
try {
  const whyResult = execSync('npm why punycode', { encoding: 'utf8' })
  console.log(whyResult)
} catch {
  console.log('❌ 无法运行 npm why')
}

// 4. 检查关键依赖包的 package.json
console.log('\n📋 检查关键依赖包:')
const keyPackages = [
  'eslint',
  'jest-environment-jsdom',
  'node_modules/eslint',
  'node_modules/ajv',
  'node_modules/uri-js',
]

keyPackages.forEach((pkg) => {
  const pkgPath = path.join('node_modules', pkg, 'package.json')
  if (fs.existsSync(pkgPath)) {
    try {
      const pkgJson: PackageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      const deps = pkgJson.dependencies || {}
      const devDeps = pkgJson.devDependencies || {}
      const peerDeps = pkgJson.peerDependencies || {}

      if (deps.punycode || devDeps.punycode || peerDeps.punycode) {
        console.log(`  ✅ ${pkg}:`)
        if (deps.punycode) console.log(`    - dependencies: punycode@${deps.punycode}`)
        if (devDeps.punycode) console.log(`    - devDependencies: punycode@${devDeps.punycode}`)
        if (peerDeps.punycode) console.log(`    - peerDependencies: punycode@${peerDeps.punycode}`)
      } else {
        console.log(`  ❌ ${pkg}: 无 punycode 依赖`)
      }
    } catch {
      console.log(`  ⚠️ ${pkg}: 无法解析 package.json`)
    }
  } else {
    console.log(`  ⚠️ ${pkg}: 包不存在`)
  }
})

// 5. 分析特定的已知问题包
console.log('\n🎯 已知问题包分析:')

const knownIssues = [
  {
    name: 'eslint',
    reason: 'ESLint 包本身依赖 uri-js → punycode 链',
    path: 'node_modules/eslint/node_modules/uri-js',
  },
  {
    name: 'jest-environment-jsdom',
    reason: 'JSDOM 依赖 tough-cookie → psl → punycode',
    path: 'node_modules/jest-environment-jsdom/node_modules/jsdom',
  },
  {
    name: 'whatwg-url',
    reason: 'WHATWG URL 标准 → tr46 → punycode',
    path: 'node_modules/whatwg-url',
  },
]

knownIssues.forEach((issue) => {
  console.log(`\n📦 ${issue.name}:`)
  console.log(`  ⚠️  原因: ${issue.reason}`)

  const uriJsPath = path.join('node_modules', issue.name, 'node_modules', 'uri-js', 'package.json')
  if (fs.existsSync(uriJsPath)) {
    try {
      const pkgJson: PackageJson = JSON.parse(fs.readFileSync(uriJsPath, 'utf8'))
      console.log(`  📋 版本: uri-js@${pkgJson.description}`)
      console.log(`  🔗 punycode 依赖: ${pkgJson.dependencies?.punycode || 'N/A'}`)
    } catch {
      console.log(`  ⚠️ 无法读取 uri-js 包信息`)
    }
  }
})

console.log('\n📊 总结:')
console.log('1. ✅ 直接 punycode 依赖: 检查完成')
console.log('2. ✅ 依赖树分析: 完成')
console.log('3. ✅ 关键包检查: 完成')
console.log('4. ✅ 已知问题分析: 完成')
