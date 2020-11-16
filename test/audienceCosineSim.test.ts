import { AudienceDefinition, VectorQueryComparasionTypes } from '../types';
import { edkt } from '../src';

const cosineSimAudience: AudienceDefinition = {
  definition: {
    featureVersion: 1,
    lookBack: 2592000,
    occurrences: 1,
    queryFilterComparisonType: VectorQueryComparasionTypes.cosineSimilarity,
    queryProperty: 'dv',
    queryValue: {
      threshold: 0.8,
      vector: [1,1,1],
    },
    ttl: 2592000,
  },
  id: 'testid',
  name: 'cosineSimAudience',
  version: 1
}

const pageFeatures = {
  dv: {
    value: [1,1,1],
    version: 1
  }
}

describe('Test cosine similarity based audiences', () => {
  beforeAll(async () => {
    localStorage.clear();
  });

  it('Check page views are empty', () => {
    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );
    expect(edktPageViews.length).toEqual(0);
  })

  it('First run -> add 1st page view and do not match audience definition', async () => {
    await edkt.run({
      pageFeatures,
      audienceDefinitions: [cosineSimAudience],
      omitGdprConsent: true,
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(1);
    expect(edktMatchedAudiences.length).toEqual(0);
  });
  
  it('Second run -> add 2nd page view and match audience definition', async () => {
    await edkt.run({
      pageFeatures,
      audienceDefinitions: [cosineSimAudience],
      omitGdprConsent: true,
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(2);
    expect(edktMatchedAudiences.length).toEqual(1);
  });
});
