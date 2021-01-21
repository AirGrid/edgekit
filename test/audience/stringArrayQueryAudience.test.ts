import { edkt } from '../../src';
import {
  sportInterestAudience,
  sportKeywords,
} from '../helpers/audienceDefinitions';
import {
  getPageViews,
  getMatchedAudiences,
} from '../helpers/localStorageSetup';

describe('string array audience matching behaviour', () => {
  const sportPageFeature = {
    keywords: {
      version: 1,
      value: sportKeywords,
    },
  };

  beforeAll(() => {
    // add one initial view
    edkt.run({
      pageFeatures: sportPageFeature,
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });
  });

  it('adds page view but does not match of first run', async () => {
    await edkt.run({
      pageFeatures: sportPageFeature,
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });

    expect(getPageViews()).toHaveLength(2);
    expect(getMatchedAudiences()).toHaveLength(0);
  });

  it('adds another page view and does match on second run', async () => {
    await edkt.run({
      pageFeatures: sportPageFeature,
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });

    expect(getPageViews()).toHaveLength(3);
    expect(getMatchedAudiences()).toHaveLength(1);
  });

  it('adds another page view and does match on third run', async () => {
    await edkt.run({
      pageFeatures: sportPageFeature,
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });

    expect(getPageViews()).toHaveLength(4);
    expect(getMatchedAudiences()).toHaveLength(1);
  });
});
