import { edkt } from '../src';
import { AudienceDefinition, PageView } from '../types';
import { timeStampInSecs } from 'src/utils';
import { viewStore } from 'src/store'

const sportPageFeatureGetter = {
  name: 'keywords',
  func: (): Promise<string[]> => {
    return Promise.resolve(['sport']);
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

const ONE_SPORTS_PAGE_VIEW: Array<PageView> = [
  { ts: timeStampInSecs(), features: { keywords: ['sport'] } },
];

const TWO_SPORTS_PAGE_VIEW: Array<PageView> = [
  { ts: timeStampInSecs(), features: { keywords: ['sport'] } },
  { ts: timeStampInSecs(), features: { keywords: ['sport'] } },
];

const TWO_SPORTS_PAGE_VIEW_AFTER_TTL: Array<PageView> = [
  { ts: timeStampInSecs() - TTL, features: { keywords: ['sport'] } },
  { ts: timeStampInSecs() - TTL, features: { keywords: ['sport'] } },
];

const setUpLocalStorage = (pageViews: Array<PageView>) => {
  localStorage.clear();
  localStorage.setItem('edkt_page_views', JSON.stringify(pageViews));
  //We need to reload from local storage because its only done on construction
  viewStore._load();
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

    const edktMatchedAudeinces = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(2);
    expect(edktMatchedAudeinces.length).toEqual(0);
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

    const edktMatchedAudeinces = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(3);
    expect(edktMatchedAudeinces.length).toEqual(1);
  });

  it('does not with two sport page view after ttl', async () => {
    setUpLocalStorage(TWO_SPORTS_PAGE_VIEW_AFTER_TTL);

    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportAudience],
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudeinces = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(3);
    expect(edktMatchedAudeinces.length).toEqual(0);
  });
});
