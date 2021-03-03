module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: [
    '**/test/unit/**/?(*.)+(test).+(ts|js)',
  ],
  automock: false,
  setupFiles: ['./test/setupJest.ts'],
  modulePaths: ['<rootDir>'],
};
