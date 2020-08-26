import { edkt, sportInterestAudience } from '../src';
const sportKeywords = ['golf', 'liverpool', 'football', 'sport'];

const sportPageFeatureGetter = {
  name: 'keywords',
  func: (): Promise<string[]> => {
    return Promise.resolve(sportKeywords);
  },
};

describe('Test edkt audience matching', () => {
  beforeAll(async () => {
    localStorage.clear();
    // add one initial view
    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });
  });

  it('First run -> add page view but do not match', async () => {
    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(2);
    expect(edktMatchedAudiences.length).toEqual(0);
  });

  it('Second run -> add another page view & match', async () => {
    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(3);
    expect(edktMatchedAudiences.length).toEqual(1);
  });

  it('Third run -> add another page view & match', async () => {
    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(4);
    expect(edktMatchedAudiences.length).toEqual(1);
  });
});
