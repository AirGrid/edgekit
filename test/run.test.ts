import { edkt } from '../src';
import { AudienceDefinition, PageView } from '../types';
import { timeStampInSecs } from 'src/utils';
import { viewStore, audienceStore } from 'src/store';
import { pageViewCreator } from './helpers/localStorageSetup';

const sportPageFeatureGetter = {
  name: 'keywords',
  func: (): Promise<string[]> => {
    return Promise.resolve(['sport']);
  },
};

const travelPageFeatureGetter = {
  name: 'keywords',
  func: (): Promise<string[]> => {
    return Promise.resolve(['travel']);
  },
};

const TTL = 10;

const sportAudience: AudienceDefinition = {
  id: 'sport_id',
  name: 'Sport Audience',
  ttl: TTL,
  lookback: 10,
  occurrences: 2,
  keywords: ['sport'],
};

const travelAudience: AudienceDefinition = {
  id: 'travel_id',
  name: 'Travel Audience',
  ttl: TTL,
  lookback: 10,
  occurrences: 2,
  keywords: ['travel'],
};

const ONE_SPORTS_PAGE_VIEW: Array<PageView> = pageViewCreator(
  timeStampInSecs(),
  ['sport'],
  1
);
const TWO_SPORTS_PAGE_VIEW: Array<PageView> = pageViewCreator(
  timeStampInSecs(),
  ['sport'],
  2
);
const TWO_SPORTS_PAGE_VIEW_AFTER_TTL: Array<PageView> = pageViewCreator(
  timeStampInSecs() - TTL,
  ['sport'],
  2
);

const setUpLocalStorage = (pageViews: Array<PageView>) => {
  localStorage.clear();
  localStorage.setItem('edkt_page_views', JSON.stringify(pageViews));
  //We need to reload from local storage because its only done on construction
  viewStore._load();
  audienceStore._load();
};

describe('Test edkt run', () => {
  it('does not match with one sport page view', async () => {
    setUpLocalStorage(ONE_SPORTS_PAGE_VIEW);

    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportAudience],
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(2);
    const latestKeywords =
      edktPageViews[edktPageViews.length - 1].features.keywords;
    expect(latestKeywords).toEqual(['sport']);
    expect(edktMatchedAudiences.length).toEqual(0);
  });

  it('does match with two sport page view', async () => {
    setUpLocalStorage(TWO_SPORTS_PAGE_VIEW);

    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportAudience],
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(3);
    const latestKeywords =
      edktPageViews[edktPageViews.length - 1].features.keywords;
    expect(latestKeywords).toEqual(['sport']);
    expect(edktMatchedAudiences.length).toEqual(1);
  });

  it('does not match with two sport page view & one travel view after sport ttl', async () => {
    setUpLocalStorage(TWO_SPORTS_PAGE_VIEW_AFTER_TTL);

    await edkt.run({
      pageFeatureGetters: [travelPageFeatureGetter],
      audienceDefinitions: [travelAudience],
    });

    const edktMatchedAudiences = edkt.getMatchedAudiences();

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    expect(edktPageViews.length).toEqual(3);
    const latestKeywords =
      edktPageViews[edktPageViews.length - 1].features.keywords;
    expect(latestKeywords).toEqual(['travel']);
    expect(edktMatchedAudiences.length).toEqual(0);
  });
});
