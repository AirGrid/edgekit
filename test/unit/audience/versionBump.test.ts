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
  const matchingVector = [1, 1, 1];

  const pageFeatures = {
    docVector: {
      version: 1,
      value: matchingVector,
    },
  };

  const runEdktWithData = ({
    vector,
    version,
  }: {
    vector: number[];
    version: number;
  }) => {
    const audienceDefinitions = [
      makeAudienceDefinition({
        version,
        occurrences: 0,
        definition: [
          makeLogisticRegressionQuery({
            queryValue: {
              threshold: 0.9,
              vector,
              bias: 0,
            },
          }),
        ],
      }),
    ];

    return edkt.run({
      pageFeatures,
      audienceDefinitions,
      omitGdprConsent: true,
    });
  };

  describe('edkt unmatching behaviour on audience version bump', () => {
    beforeAll(() => {
      clearStore();
    });

    it('should match pageView against audienceDefinition', async () => {
      await runEdktWithData({
        vector: matchingVector,
        version: 1,
      });

      expect(getPageViews()).toHaveLength(1);
      expect(getMatchedAudiences()).toHaveLength(1);
    });

    it('should unmatch pageView on audienceDefinition version bump', async () => {
      await runEdktWithData({
        version: 2,
        vector: [0, 0, 0], // this does not match
      });

      expect(getPageViews()).toHaveLength(2);
      expect(getMatchedAudiences()).toHaveLength(0);
    });
  });

  describe('edkt feature version bump behaviour on matching audience version bump', () => {
    beforeAll(() => {
      clearStore();
    });

    it('should update pageView version on matching audienceDefinition with version bump', async () => {
      await runEdktWithData({
        version: 1,
        vector: matchingVector,
      });

      await runEdktWithData({
        version: 2,
        vector: matchingVector,
      });

      const matchedAudiences = getMatchedAudiences();
      const pageViews = getPageViews();

      expect(pageViews).toHaveLength(2);
      expect(matchedAudiences).toHaveLength(1);
      expect(matchedAudiences[0]).toHaveProperty('version', 2);
    });
  });
});
