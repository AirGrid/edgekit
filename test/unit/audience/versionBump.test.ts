import { edkt } from '../../../src';
import {
  clearStore,
  getPageViews,
  getMatchedAudiences,
} from '../../helpers/localStorage';
import {
  makeAudienceDefinition,
  makeLogisticRegressionQuery,
} from '../../helpers/audienceDefinitions';

describe('edkt behaviour on audience version bump', () => {
  const MATCHING_VECTOR = [1, 1, 1];
  const NOT_MATCHING_VECTOR = [0, 0, 0];

  const pageFeatures = {
    docVector: {
      version: 1,
      value: MATCHING_VECTOR,
    },
  };

  describe('edkt unmatching behaviour on audience version bump', () => {
    beforeAll(clearStore);

    it('should match pageView against audienceDefinition', async () => {
      const audienceDefinitions = [
        makeAudienceDefinition({
          version: 1,
          occurrences: 0,
          definition: [
            makeLogisticRegressionQuery({
              queryValue: {
                threshold: 0.9,
                vector: MATCHING_VECTOR,
                bias: 0,
              },
            }),
          ],
        }),
      ];

      await edkt.run({
        pageFeatures,
        audienceDefinitions,
        omitGdprConsent: true,
      });

      const matchedAudiences = getMatchedAudiences();

      expect(getPageViews()).toHaveLength(1);
      expect(matchedAudiences).toHaveLength(1);
      expect(matchedAudiences[0]).toHaveProperty(
        'matchedOnCurrentPageView',
        true
      );
    });

    it('should unmatch matchedAudience on audienceDefinition version bump', async () => {
      const audienceDefinitions = [
        makeAudienceDefinition({
          version: 2,
          occurrences: 0,
          definition: [
            makeLogisticRegressionQuery({
              queryValue: {
                threshold: 0.9,
                vector: NOT_MATCHING_VECTOR,
                bias: 0,
              },
            }),
          ],
        }),
      ];

      await edkt.run({
        pageFeatures,
        audienceDefinitions,
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(2);
      expect(getMatchedAudiences()).toHaveLength(0);
    });
  });

  describe('edkt feature version bump behaviour on matching audience version bump', () => {
    beforeAll(clearStore);

    it('should update matchedAudience version on matching audienceDefinition with version bump', async () => {
      const audienceDefinitionVersionOne = [
        makeAudienceDefinition({
          version: 1,
          occurrences: 0,
          definition: [
            makeLogisticRegressionQuery({
              queryValue: {
                threshold: 0.9,
                vector: MATCHING_VECTOR,
                bias: 0,
              },
            }),
          ],
        }),
      ];

      const audienceDefinitionVersionTwo = [
        makeAudienceDefinition({
          version: 2,
          occurrences: 0,
          definition: [
            makeLogisticRegressionQuery({
              queryValue: {
                threshold: 0.9,
                vector: MATCHING_VECTOR,
                bias: 0,
              },
            }),
          ],
        }),
      ];

      await edkt.run({
        pageFeatures,
        audienceDefinitions: audienceDefinitionVersionOne,
        omitGdprConsent: true,
      });

      await edkt.run({
        pageFeatures,
        audienceDefinitions: audienceDefinitionVersionTwo,
        omitGdprConsent: true,
      });

      const matchedAudiences = getMatchedAudiences();
      const pageViews = getPageViews();

      expect(pageViews).toHaveLength(2);
      expect(matchedAudiences).toHaveLength(1);
      expect(matchedAudiences[0]).toHaveProperty('version', 2);
      expect(matchedAudiences[0]).toHaveProperty(
        'matchedOnCurrentPageView',
        false
      );
    });
  });
});
