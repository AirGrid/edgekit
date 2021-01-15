import {
  sportInterestAudience,
  sportKeywords,
} from '../helpers/audienceDefinitions';
import { edkt } from '../../src';
import {
  clearStore,
  getPageViews,
  getMatchedAudiences,
} from '../helpers/localStorageSetup';

const sportPageFeature = {
  keywords: {
    version: 1,
    value: sportKeywords,
  },
};

describe('Test edkt audience matching', () => {
  beforeAll(async () => {
    clearStore();
    // add one initial view
    await edkt.run({
      pageFeatures: sportPageFeature,
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });
  });

  it('First run -> add page view but do not match', async () => {
    await edkt.run({
      pageFeatures: sportPageFeature,
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });

    expect(getPageViews()).toHaveLength(2);
    expect(getMatchedAudiences()).toHaveLength(0);
  });

  it('Second run -> add another page view & match', async () => {
    await edkt.run({
      pageFeatures: sportPageFeature,
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });

    expect(getPageViews()).toHaveLength(3);
    expect(getMatchedAudiences()).toHaveLength(1);
  });

  it('Third run -> add another page view & match', async () => {
    await edkt.run({
      pageFeatures: sportPageFeature,
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });

    expect(getPageViews()).toHaveLength(4);
    expect(getMatchedAudiences()).toHaveLength(1);
  });
});
