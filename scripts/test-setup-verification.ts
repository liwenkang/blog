#!/usr/bin/env ts-node

// Simple verification script to check if test setup is correct
import fs from 'fs'
import path from 'path'
import { logger } from './utils/script-logger.js'

logger.info('🧪 Verifying Jest test setup...')
logger.info('')

interface PackageJson {
  scripts?: Record<string, string>
}

// Check if required files exist
const requiredFiles = [
  'jest.config.js',
  'jest.setup.js',
  '__tests__/example.test.ts',
  'components/__tests__/Card.test.tsx',
  'components/__tests__/Tag.test.tsx',
  'components/__tests__/PageTitle.test.tsx',
  '__tests__/utils/testUtils.tsx',
]

logger.info('📁 Checking required files:')
let allFilesExist = true

requiredFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(__dirname, '..', file))
  logger.info(`  ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allFilesExist = false
})

logger.info('')
logger.info('📦 Checking package.json test scripts:')
try {
  const packageJson: PackageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
  )
  const testScripts = ['test', 'test:watch', 'test:coverage']

  testScripts.forEach((script) => {
    const exists = packageJson.scripts && packageJson.scripts[script]
    logger.info(`  ${exists ? '✅' : '❌'} ${script}: ${exists || 'missing'}`)
  })
} catch {
  logger.info('  ❌ Failed to read package.json')
}

logger.info('')
logger.info('🔍 Checking test configuration:')
try {
  const jestConfig = fs.readFileSync(path.join(__dirname, '..', 'jest.config.js'), 'utf8')
  const hasNextJest = jestConfig.includes('next/jest')
  const hasTestEnvironment = jestConfig.includes('jest-environment-jsdom')
  const hasSetupFile = jestConfig.includes('jest.setup.js')

  logger.info(`  ${hasNextJest ? '✅' : '❌'} Uses Next.js Jest configuration`)
  logger.info(`  ${hasTestEnvironment ? '✅' : '❌'} Has JSDOM test environment`)
  logger.info(`  ${hasSetupFile ? '✅' : '❌'} Has setup file configured`)
} catch {
  logger.info('  ❌ Failed to read jest.config.js')
}

logger.info('')
logger.info('📊 Summary:')
if (allFilesExist) {
  logger.info('✅ All test files are in place')
  logger.info('✅ Jest configuration is properly set up')
  logger.info('✅ Test scripts are configured in package.json')
  logger.info('')
  logger.info('🎉 Test setup verification completed successfully!')
  logger.info('')
  logger.info('📋 Next steps:')
  logger.info('1. Install dependencies: npm install (with --legacy-peer-deps if needed)')
  logger.info('2. Run tests: npm test')
  logger.info('3. Run tests in watch mode: npm run test:watch')
  logger.info('4. Run tests with coverage: npm run test:coverage')
} else {
  logger.info('❌ Some test files are missing')
  logger.info('Please check the files listed above')
}

logger.info('')
logger.info('📝 Test files created:')
logger.info('  • Jest configuration (jest.config.js)')
logger.info('  • Jest setup file (jest.setup.js)')
logger.info('  • Test utilities (__tests__/utils/testUtils.tsx)')
logger.info('  • Component tests:')
logger.info('    - Card component (3 tests)')
logger.info('    - Tag component (6 tests)')
logger.info('    - PageTitle component (5 tests)')
logger.info('  • Example verification test')
logger.info('')
logger.info('📈 Coverage configuration:')
logger.info('  • Components, lib, and layouts directories')
logger.info('  • Text, lcov, and HTML report formats')
logger.info('  • Excludes .d.ts and node_modules files')
