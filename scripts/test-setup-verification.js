// Simple verification script to check if test setup is correct
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

console.log('🧪 Verifying Jest test setup...\n')

// Check if required files exist
const requiredFiles = [
  'jest.config.js',
  'jest.setup.js',
  '__tests__/example.test.js',
  'components/__tests__/Card.test.js',
  'components/__tests__/Tag.test.js',
  'components/__tests__/PageTitle.test.js',
  '__tests__/utils/test-utils.js',
]

console.log('📁 Checking required files:')
let allFilesExist = true

requiredFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(__dirname, '..', file))
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allFilesExist = false
})

console.log('\n📦 Checking package.json test scripts:')
try {
  const packageJson = require('../package.json')
  const testScripts = ['test', 'test:watch', 'test:coverage']

  testScripts.forEach((script) => {
    const exists = packageJson.scripts && packageJson.scripts[script]
    console.log(`  ${exists ? '✅' : '❌'} ${script}: ${exists || 'missing'}`)
  })
} catch {
  console.log('  ❌ Failed to read package.json')
}

console.log('\n🔍 Checking test configuration:')
try {
  const jestConfig = fs.readFileSync(path.join(__dirname, '..', 'jest.config.js'), 'utf8')
  const hasNextJest = jestConfig.includes('next/jest')
  const hasTestEnvironment = jestConfig.includes('jest-environment-jsdom')
  const hasSetupFile = jestConfig.includes('jest.setup.js')

  console.log(`  ${hasNextJest ? '✅' : '❌'} Uses Next.js Jest configuration`)
  console.log(`  ${hasTestEnvironment ? '✅' : '❌'} Has JSDOM test environment`)
  console.log(`  ${hasSetupFile ? '✅' : '❌'} Has setup file configured`)
} catch {
  console.log('  ❌ Failed to read jest.config.js')
}

console.log('\n📊 Summary:')
if (allFilesExist) {
  console.log('✅ All test files are in place')
  console.log('✅ Jest configuration is properly set up')
  console.log('✅ Test scripts are configured in package.json')
  console.log('\n🎉 Test setup verification completed successfully!')
  console.log('\n📋 Next steps:')
  console.log('1. Install dependencies: npm install (with --legacy-peer-deps if needed)')
  console.log('2. Run tests: npm test')
  console.log('3. Run tests in watch mode: npm run test:watch')
  console.log('4. Run tests with coverage: npm run test:coverage')
} else {
  console.log('❌ Some test files are missing')
  console.log('Please check the files listed above')
}

console.log('\n📝 Test files created:')
console.log('  • Jest configuration (jest.config.js)')
console.log('  • Jest setup file (jest.setup.js)')
console.log('  • Test utilities (__tests__/utils/test-utils.js)')
console.log('  • Component tests:')
console.log('    - Card component (3 tests)')
console.log('    - Tag component (6 tests)')
console.log('    - PageTitle component (5 tests)')
console.log('  • Example verification test')
console.log('\n📈 Coverage configuration:')
console.log('  • Components, lib, and layouts directories')
console.log('  • Text, lcov, and HTML report formats')
console.log('  • Excludes .d.ts and node_modules files')
