import {
  sportInterestAudience,
  sportKeywords,
} from './helpers/audienceDefinitions';
import { edkt } from '../src';

const sportPageFeature = {
  keywords: {
    version: 1,
    value: sportKeywords,
  }
};

describe('Test edkt audience matching', () => {
  beforeAll(async () => {
    localStorage.clear();
    // add one initial view
    await edkt.run({
      pageFeatures: sportPageFeature,
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });
  });

  it('First run -> add page view but do not match', async () => {
    await edkt.run({
      pageFeatures: sportPageFeature,
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
      pageFeatures: sportPageFeature,
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
      pageFeatures: sportPageFeature,
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
