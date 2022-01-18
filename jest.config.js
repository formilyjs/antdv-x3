/*
 * @Author: Gavin Chan
 * @Date: 2022-01-18 10:44:11
 * @LastEditors: Gavin
 * @LastEditTime: 2022-01-18 10:51:53
 * @FilePath: \antdv-x3\jest.config.js
 * @Descriptions: todo
 */
// const path = require('path')
module.exports = {
  collectCoverage: true,
  verbose: true,
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  testMatch: ['**/__tests__/**/*.spec.[jt]s?(x)'],
  setupFilesAfterEnv: [
    require.resolve('jest-dom/extend-expect'),
    './global.config.ts',
  ],
  // moduleNameMapper: process.env.TEST_ENV === 'production' ? undefined : alias,
  globals: {
    'ts-jest': {
      babelConfig: false,
      tsconfig: './tsconfig.jest.json',
      diagnostics: false,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/esm/',
    '/lib/',
    'package.json',
    '/demo/',
    '/packages/builder/src/__tests__/',
    '/packages/builder/src/components/',
    '/packages/builder/src/configs/',
    'package-lock.json',
  ],
}
