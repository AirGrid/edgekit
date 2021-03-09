import { edkt } from '../../../src';
import {
  clearStore,
  getPageViews,
  getMatchedAudiences,
} from '../../helpers/localStorage';
import {
  AudienceDefinition,
  QueryFilterComparisonType,
  VectorQueryValue,
} from '../../../types';

describe('edkt behaviour on audience version bump', () => {
  const pageFeatures = {
    topicDist: {
      version: 1,
      value: [1, 1, 1],
    },
  };

  const matchingQueryValue = {
    vector: pageFeatures.topicDist.value,
    threshold: 0.99,
  };

  type MakeAudienceData = {
    version: number;
    queryValue: VectorQueryValue;
  };

  const makeAudience = ({
    version,
    queryValue,
  }: MakeAudienceData): AudienceDefinition => ({
    id: 'iab-607',
    version,
    ttl: 3600,
    lookBack: 0,
    occurrences: 0,
    definition: [
      {
        featureVersion: 1,
        queryProperty: 'topicDist',
        queryValue,
        queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
      },
    ],
  });

  const runEdktWithData = (data: MakeAudienceData) =>
    edkt.run({
      pageFeatures,
      audienceDefinitions: [makeAudience(data)],
      omitGdprConsent: true,
    });

  /* Should compute as follow:
   * - if a user has matched version 1, and the most recent audience version available is 1, we should not run the checking.
   * - if a user has matched version 1, and the most recent audience version available is 2, we should run the checking.
   *   - if they not do not match the new version (2), but had matched 1, we must remove this audience from matched.
   *   - if they matched v1 and now match on v2, they remain in the audience but with the updated version
   */

  describe('edkt unmatching behaviour on audience version bump', () => {
    beforeAll(() => {
      clearStore();
    });

    it('should match pageView against audienceDefinition', async () => {
      await runEdktWithData({
        version: 1,
        queryValue: matchingQueryValue,
      });

      expect(getPageViews()).toHaveLength(1);
      expect(getMatchedAudiences()).toHaveLength(1);
    });

    it('should unmatch pageView on audienceDefinition version bump', async () => {
      await runEdktWithData({
        version: 2,
        queryValue: {
          vector: [0, 0, 0], // this does not match
          threshold: 0.99,
        },
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
        queryValue: matchingQueryValue,
      });

      await runEdktWithData({
        version: 2,
        queryValue: matchingQueryValue,
      });

      const matchedAudiences = getMatchedAudiences();
      const pageViews = getPageViews();

      expect(pageViews).toHaveLength(2);
      expect(matchedAudiences).toHaveLength(1);
      expect(matchedAudiences[0]).toHaveProperty('version', 2);
    });
  });
});
