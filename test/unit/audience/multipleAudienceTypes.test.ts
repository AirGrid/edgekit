import { edkt } from '../../../src';
import {
  getMatchedAudiences,
  getPageViews,
  clearStore,
} from '../../helpers/localStorage';
import {
  cosineSimAudience,
  logRegAudience,
} from '../../helpers/audienceDefinitions';

describe('multiple audiences types matching behaviour', () => {
  const cosSimId = 'cosSimAudience';
  const logRegId = 'logRegAudience';

  const audienceDefinitions = [
    { ...cosineSimAudience, id: cosSimId, occurrences: 0 },
    { ...logRegAudience, id: logRegId, occurrences: 0 },
  ];

  describe('logistic regression plus cosine similarity audiences, query matching both', () => {
    const pageFeatures = {
      topicDist: {
        value: [1, 1, 1],
        version: 1,
      },
      docVector: {
        value: [1, 1, 1],
        version: 1,
      },
    };

    beforeAll(clearStore);

    it('adds page view and does match both audiences', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions,
        omitGdprConsent: true,
      });

      const matchedAudiences = getMatchedAudiences();

      expect(getPageViews()).toHaveLength(1);
      expect(matchedAudiences).toHaveLength(2);
      expect(matchedAudiences).toContainEqual(
        expect.objectContaining({
          id: cosSimId,
        })
      );
      expect(matchedAudiences).toContainEqual(
        expect.objectContaining({
          id: logRegId,
        })
      );
    });
  });

  describe('logistic regression plus cosine similarity audiences, query matching cosSim only', () => {
    const pageFeatures = {
      topicDist: {
        value: [1, 1, 1],
        version: 1,
      },
      docVector: {
        value: [0, 0, 0], //doesn't match
        version: 1,
      },
    };

    beforeAll(clearStore);

    it('adds page view and does match cosine similarity audience', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions,
        omitGdprConsent: true,
      });

      const matchedAudiences = getMatchedAudiences();

      expect(getPageViews()).toHaveLength(1);
      expect(matchedAudiences).toHaveLength(1);
      expect(matchedAudiences).toContainEqual(
        expect.objectContaining({
          id: cosSimId,
        })
      );
      expect(matchedAudiences).not.toContainEqual(
        expect.objectContaining({
          id: logRegId,
        })
      );
    });
  });

  describe('logistic regression plus cosine similarity audiences, query matching logReg only', () => {
    const pageFeatures = {
      topicDist: {
        value: [0, 0, 0], //doesn't match
        version: 1,
      },
      docVector: {
        value: [1, 1, 1],
        version: 1,
      },
    };

    beforeAll(clearStore);

    it('adds page view and does match logistic regression audience', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions,
        omitGdprConsent: true,
      });

      const matchedAudiences = getMatchedAudiences();

      expect(getPageViews()).toHaveLength(1);
      expect(matchedAudiences).toHaveLength(1);
      expect(matchedAudiences).not.toContainEqual(
        expect.objectContaining({
          id: cosSimId,
        })
      );
      expect(matchedAudiences).toContainEqual(
        expect.objectContaining({
          id: logRegId,
        })
      );
    });
  });
});
