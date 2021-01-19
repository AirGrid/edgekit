/// <reference types="jest-playwright-preset" />
/// <reference types="expect-playwright" />

import { mockHtmlResponse } from '../helpers/network';
import * as examplePage from '../fixtures/examplePage.json';
import { edkt } from '../../src/index';

describe('edgekit basic run behaviour', () => {
  const testUrl = 'https://example.com/';

  beforeEach(async () => {
    mockHtmlResponse(page, `${testUrl}?edktDebug=true`, examplePage);
  });

  it('runs', async () => {
    await page.goto(`${testUrl}?edktDebug=true`, { waitUntil: 'load' });
    await page.evaluate(
      (params) => {
        console.log(localStorage);
        edkt.run(params);
      },
      {
        audienceDefinitions: [],
        pageFeatures: {},
        omitGdprConsent: true,
      }
    );
  });
});
