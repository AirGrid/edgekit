module.exports = {
  verbose: true,
  preset: 'jest-playwright-preset',
  testMatch: [
    '**/__tests__/**/*.+(ts|js)',
    '**/test/e2e/?(*.)+(spec|test).+(ts|js)',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironmentOptions: {
    'jest-playwright': {
      browsers: ['firefox'],
      exitOnPageError: false, // GitHub currently throws errors
      lauchOptions: {
        headless: true,
      },
    },
  },
};
