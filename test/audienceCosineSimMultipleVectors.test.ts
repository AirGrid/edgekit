import { AudienceDefinition, QueryFilterComparisonType } from '../types';
import { edkt } from '../src';

/* TODO Mock localStorage and merge single and
 * multiple vectors AudienceDefiniciton tests
 */
const cosineSimAudience: AudienceDefinition = {
  definition: {
    featureVersion: 1,
    lookBack: 2592000,
    occurrences: 1,
    queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
    queryProperty: 'dv',
    queryValue: [{
      threshold: 0.8,
      vector: [1,1,1],
    },
    {
      threshold: 0.8,
      vector: [0.2,0.2,0.2],
    }],
    ttl: 2592000,
  },
  id: 'testid',
  name: 'cosineSimAudience',
  version: 1
}

const pageFeatures0 = {
  dv: {
    value: [1,1,1],
    version: 1
  }
}

const pageFeatures1 = {
  dv: {
    value: [0.2,0.2,0.2],
    version: 1
  }
}

describe('Cosine Similarity condition test', () => {
  beforeAll(() => {
    localStorage.clear();
  });

  describe('Test cosine similarity based audiences', () => {
    it('Check page views are empty', () => {
      const edktPageViews = JSON.parse(
        localStorage.getItem('edkt_page_views') || '[]'
      );
      expect(edktPageViews.length).toEqual(0);
    })

    it('First run -> add 1st page view and do not match audience definition', async () => {
      await edkt.run({
        pageFeatures: pageFeatures0,
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
        pageFeatures: pageFeatures1,
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


    it('Third run -> add 3rd page view', async () => {
      await edkt.run({
        pageFeatures: pageFeatures0,
        audienceDefinitions: [cosineSimAudience],
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

    it('Fourth run -> add 4th page view', async () => {
      await edkt.run({
        pageFeatures: pageFeatures1,
        audienceDefinitions: [cosineSimAudience],
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
});
