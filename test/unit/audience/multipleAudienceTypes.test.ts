import { edkt } from '../../../src';
import {
  getMatchedAudiences,
  getPageViews,
  clearStore,
} from '../../helpers/localStorage';
import {
  makeAudienceDefinition,
  makeLogisticRegressionQuery,
  makeCosineSimilarityQuery,
} from '../../helpers/audienceDefinitions';

describe('multiple audiences types matching behaviour', () => {
  const cosSimId = 'cosSimAudience';
  const logRegId = 'logRegAudience';

  const makeLogRegAudience = (vector: number[], queryProperty = 'docVector') =>
    makeAudienceDefinition({
      id: logRegId,
      occurrences: 0,
      definition: [
        makeLogisticRegressionQuery({
          queryValue: {
            vector,
            threshold: 0.9,
            bias: 0,
          },
          queryProperty,
        }),
      ],
    });

  const makeCosSimAudience = (vector: number[], queryProperty = 'topicDist') =>
    makeAudienceDefinition({
      id: cosSimId,
      occurrences: 0,
      definition: [
        makeCosineSimilarityQuery({
          queryValue: {
            vector,
            threshold: 0.9,
          },
          queryProperty,
        }),
      ],
    });

  beforeEach(clearStore);

  describe('multiple audiences with different features', () => {
    const logRegAudience = makeLogRegAudience([1, 1, 1]);
    const cosSimAudience = makeCosSimAudience([1, 1, 1]);

    const audienceDefinitions = [cosSimAudience, logRegAudience];

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

  describe('multiple audiences with same features', () => {
    const pageFeatures = {
      docVector: {
        value: [1, 1, 1],
        version: 1,
      },
    };

    describe('logistic regression plus cosine similarity audiences, query matching both', () => {
      const cosSimAudience = makeCosSimAudience([1, 1, 1], 'docVector');
      const logRegAudience = makeLogRegAudience([1, 1, 1], 'docVector');
      const audienceDefinitions = [cosSimAudience, logRegAudience];

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
      const cosSimAudience = makeCosSimAudience([1, 1, 1], 'docVector');
      const logRegAudience = makeLogRegAudience([0, 0, 0], 'docVector'); // doesn't match
      const audienceDefinitions = [cosSimAudience, logRegAudience];

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
      const cosSimAudience = makeCosSimAudience([0, 0, 0], 'docVector'); // doesn't match
      const logRegAudience = makeLogRegAudience([1, 1, 1], 'docVector');
      const audienceDefinitions = [cosSimAudience, logRegAudience];

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
});
