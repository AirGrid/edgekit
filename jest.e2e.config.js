module.exports = {
  verbose: true,
  preset: 'jest-playwright-preset',
  testMatch: ['**/test/e2e/**/?(*.)+(test).+(ts|js)'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
