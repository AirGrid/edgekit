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

  const matchingVector = [1, 1, 1];
  const notMatchingVector = [0, 0, 0];

  type AudienceFactoryInput = {
    vector: number[];
    queryProperty: string;
  };

  const makeLogRegAudience = ({
    vector,
    queryProperty,
  }: AudienceFactoryInput) =>
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

  const makeCosSimAudience = ({
    vector,
    queryProperty,
  }: AudienceFactoryInput) =>
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
    const logRegAudience = makeLogRegAudience({
      vector: matchingVector,
      queryProperty: 'logRegVector',
    });
    const cosSimAudience = makeCosSimAudience({
      vector: matchingVector,
      queryProperty: 'cosSimVector',
    });

    const audienceDefinitions = [cosSimAudience, logRegAudience];

    describe('logistic regression plus cosine similarity audiences, query matching both', () => {
      const pageFeatures = {
        cosSimVector: {
          value: matchingVector,
          version: 1,
        },
        logRegVector: {
          value: matchingVector,
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
        cosSimVector: {
          value: matchingVector,
          version: 1,
        },
        logRegVector: {
          value: notMatchingVector,
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
        cosSimVector: {
          value: notMatchingVector,
          version: 1,
        },
        logRegVector: {
          value: matchingVector,
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
      logRegVector: {
        value: matchingVector,
        version: 1,
      },
    };

    describe('logistic regression plus cosine similarity audiences, query matching both', () => {
      const cosSimAudience = makeCosSimAudience({
        vector: matchingVector,
        queryProperty: 'logRegVector',
      });
      const logRegAudience = makeLogRegAudience({
        vector: matchingVector,
        queryProperty: 'logRegVector',
      });
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
      const cosSimAudience = makeCosSimAudience({
        vector: matchingVector,
        queryProperty: 'logRegVector',
      });
      const logRegAudience = makeLogRegAudience({
        vector: notMatchingVector,
        queryProperty: 'logRegVector',
      });
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
      const cosSimAudience = makeCosSimAudience({
        vector: notMatchingVector,
        queryProperty: 'logRegVector',
      }); // doesn't match
      const logRegAudience = makeLogRegAudience({
        vector: matchingVector,
        queryProperty: 'logRegVector',
      });
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
