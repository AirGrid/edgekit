import { edkt } from '../src';
import { AudienceDefinition } from 'types';

const sportKeywords = ['golf', 'liverpool', 'football', 'sport'];

const sportPageFeatureGetter = {
  name: 'keywords',
  func: (): Promise<string[]> => {
    return Promise.resolve(sportKeywords);
  },
};

const sportAudienceDefinition: AudienceDefinition = {
  id: 'sport_id',
  name: 'Sport Audience',
  ttl: 1,
  lookback: 2,
  occurrences: 3,
  keywords: ['sport'],
};

describe('Test edkt audience matching', () => {
  beforeAll(async () => {
    localStorage.clear();
    // add one initial view
    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportAudienceDefinition],
    });
  });

  it('First run -> add page view but do not match', async () => {
    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportAudienceDefinition],
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

  it('Second run -> add another page view but do not match', async () => {
    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportAudienceDefinition],
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(3);
    expect(edktMatchedAudiences.length).toEqual(0);
  });

  it('Third run -> add another page view & now match', async () => {
    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportAudienceDefinition],
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudeinces = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(4);
    expect(edktMatchedAudeinces.length).toEqual(1);
  });
});
