module.exports = {
  browsers: ['chromium', 'firefox', 'webkit'],
  serverOptions: [
    {
      command: 'npm run bundle && npx serve -C -l 8000 dist/sdk',
      port: 8000,
      launchTimeout: 15000,
    },
    {
      command: 'npx serve -l 9000 test/fixtures',
      port: 9000,
      launchTimeout: 25000,
    },
  ],
};
