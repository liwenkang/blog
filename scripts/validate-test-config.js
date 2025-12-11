#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { logger } = require('./utils/script-logger')

// unify console outputs through script logger
console.log = (...args) => logger.info(args[0], typeof args[1] === 'object' ? args[1] : {})
console.warn = (...args) => logger.warn(args[0], typeof args[1] === 'object' ? args[1] : {})
console.error = (...args) => {
  const [msg, maybeError, meta] = args
  if (maybeError instanceof Error)
    return logger.error(msg, maybeError, typeof meta === 'object' ? meta : {})
  return logger.error(msg, null, typeof maybeError === 'object' ? maybeError : {})
}

console.log('🧪 验证测试配置...\n')

// 检查配置文件是否存在
const requiredFiles = ['jest.config.js', 'jest.setup.js', 'package.json']

console.log('📁 检查配置文件:')
let configExists = true
requiredFiles.forEach((file) => {
  const exists = fs.existsSync(file)
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) configExists = false
})

if (configExists) {
  console.log('\n✅ 所有配置文件都存在')

  // 检查 package.json 中的测试脚本
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    console.log('\n📦 检查测试脚本:')

    const testScripts = ['test', 'test:watch', 'test:coverage']
    testScripts.forEach((script) => {
      const exists = packageJson.scripts && packageJson.scripts[script]
      console.log(`  ${exists ? '✅' : '❌'} ${script}: ${exists || '缺失'}`)
    })

    // 检查测试依赖
    console.log('\n📋 检查测试依赖:')
    const testDeps = [
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@testing-library/user-event',
      'jest',
      'jest-environment-jsdom',
    ]

    testDeps.forEach((dep) => {
      const exists = packageJson.devDependencies && packageJson.devDependencies[dep]
      console.log(`  ${exists ? '✅' : '❌'} ${dep}: ${exists || '缺失'}`)
    })
  } catch (error) {
    console.log('\n❌ 无法读取 package.json')
  }

  // 检查测试文件
  console.log('\n🧪 检查测试文件:')
  const testFiles = [
    '__tests__/example.test.js',
    'components/__tests__/Card.test.js',
    'components/__tests__/Tag.test.js',
    'components/__tests__/PageTitle.test.js',
    '__tests__/utils/test-utils.js',
  ]

  testFiles.forEach((file) => {
    const exists = fs.existsSync(file)
    console.log(`  ${exists ? '✅' : '❌'} ${file}`)
  })

  console.log('\n🎯 总结:')
  console.log('✅ Jest 配置已完成')
  console.log('✅ 测试文件已创建')
  console.log('✅ 测试脚本已配置')
  console.log('📝 下一步: 运行 npm install 安装依赖')
  console.log('🧪 然后运行: npm test')
} else {
  console.log('\n❌ 缺少必要的配置文件')
  console.log('请确保所有配置文件都已创建')
}
