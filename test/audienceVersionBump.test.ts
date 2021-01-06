import { sportKeywords } from './helpers/audienceDefinitions';
import { edkt } from '../src';
import {
  clearStore,
  getPageViews,
  getMatchedAudiences,
} from './helpers/localStorageSetup';
import {
  AudienceDefinition,
  QueryFilterComparisonType,
  StringArrayQueryValue,
} from '../types';

const sportPageFeature = {
  keywords: {
    version: 1,
    value: sportKeywords,
  },
};

type MakeAudienceData = {
  version: number;
  queryValue: StringArrayQueryValue;
};

export const makeSportInterestAudience = ({
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
      queryProperty: 'keywords',
      queryValue,
      queryFilterComparisonType: QueryFilterComparisonType.ARRAY_INTERSECTS,
    },
  ],
});

const runEdktWithData = (data: MakeAudienceData) =>
  edkt.run({
    pageFeatures: sportPageFeature,
    audienceDefinitions: [makeSportInterestAudience(data)],
    omitGdprConsent: true,
  });

/* Should compute as follow:
 * - if a user has matched version 1, and the most recent audience version available is 1, we should not run the checking.
 * - if a user has matched version 1, and the most recent audience version available is 2, we should run the checking.
 *   - if they not do not match the new version (2), but had matched 1, we must remove this audience from matched.
 *   - if they matched v1 and now match on v2, they remain in the audience but with the updated version
 */

describe('Test edkt matched audience behaviour on version bump', () => {
  beforeAll(async () => {
    clearStore();
  });

  it('should match pageView against audienceDefinition', async () => {
    await runEdktWithData({
      version: 1,
      queryValue: sportKeywords,
    });

    expect(getPageViews().length).toEqual(1);
    expect(getMatchedAudiences().length).toEqual(1);
  });

  it('should skip checking on previously matched pageView/audienceDefinition', async () => {
    await runEdktWithData({
      version: 1,
      queryValue: sportKeywords,
    });

    expect(getPageViews().length).toEqual(2);
    expect(getMatchedAudiences().length).toEqual(1);
  });

  it('should unmatch pageView on audienceDefinition version bump', async () => {
    await runEdktWithData({
      version: 2,
      queryValue: ['Ferrari', 'Lamborghini', 'Mercedes'],
    });

    expect(getPageViews().length).toEqual(3);
    expect(getMatchedAudiences().length).toEqual(0);
  });

  it('should update pageView version on matching audienceDefinition with version bump', async () => {
    await runEdktWithData({
      version: 2,
      queryValue: sportKeywords,
    });

    const matchedAudiences = getMatchedAudiences();
    const pageViews = getPageViews();

    expect(pageViews.length).toEqual(4);
    expect(matchedAudiences.length).toEqual(1);
    expect(matchedAudiences[0]).toHaveProperty('version', 2);
  });
});
