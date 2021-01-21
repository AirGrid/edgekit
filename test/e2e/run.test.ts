/// <reference types="jest-playwright-preset" />

import {
  makeAudienceDefinition,
  makeStringArrayQuery,
} from '../helpers/audienceDefinitions';

type Store = { edkt_matched_audiences: string; edkt_page_views: string };

const getPageViewsFromStore = (store: Store) =>
  JSON.parse(store['edkt_page_views']);
const getMatchedAudiencesFromStore = (store: Store) =>
  JSON.parse(store['edkt_matched_audiences']);
const getLocalStorageFromPage = (): Promise<Store> =>
  page.evaluate('localStorage');

describe('edgekit basic run behaviour', () => {
  const testUrl = 'http://localhost:9000';

  const sportAudience = makeAudienceDefinition({
    id: 'sport_id',
    occurrences: 1,
    definition: [makeStringArrayQuery(['sport'])],
  });

  const sportPageFeatures = {
    keywords: {
      version: 1,
      value: ['sport'],
    },
  };

  const runEdkt = async () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.evaluate((params) => (<any>window).edkt.edkt.run(params), {
      audienceDefinitions: [sportAudience],
      pageFeatures: sportPageFeatures,
      omitGdprConsent: true,
    });

  beforeAll(async () => {
    await page.goto(`${testUrl}?edktDebug=true`, { waitUntil: 'networkidle' });
  });

  it('runs and adds pageView to store', async () => {
    await runEdkt();
    const store = await getLocalStorageFromPage();
    expect(getPageViewsFromStore(store)).toHaveLength(1);
    expect(getMatchedAudiencesFromStore(store)).toHaveLength(0);
  });

  it('adds another pageView and match audienceDefinition', async () => {
    await runEdkt();
    const store = await getLocalStorageFromPage();
    expect(getPageViewsFromStore(store)).toHaveLength(2);
    expect(getMatchedAudiencesFromStore(store)).toHaveLength(1);
  });
});
