module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  automock: false,
  setupFiles: [
    './__test__/setupJest.ts',
  ]
};