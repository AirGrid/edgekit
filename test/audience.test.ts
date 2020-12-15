import {
  sportInterestAudience,
  sportKeywords,
} from './helpers/audienceDefinitions';
import { edkt } from '../src';
import { clearStore, getPageViews, getMatchedAudiences } from './helpers/localStorageSetup';

const sportPageFeature = {
  keywords: {
    version: 1,
    value: sportKeywords,
  }
};

describe('Test edkt audience matching', () => {
  beforeAll(async () => {
    clearStore()
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

    expect(getPageViews().length).toEqual(2);
    expect(getMatchedAudiences().length).toEqual(0);
  });

  it('Second run -> add another page view & match', async () => {
    await edkt.run({
      pageFeatures: sportPageFeature,
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });

    expect(getPageViews().length).toEqual(3);
    expect(getMatchedAudiences().length).toEqual(1);
  });

  it('Third run -> add another page view & match', async () => {
    await edkt.run({
      pageFeatures: sportPageFeature,
      audienceDefinitions: [sportInterestAudience],
      omitGdprConsent: true,
    });

    expect(getPageViews().length).toEqual(4);
    expect(getMatchedAudiences().length).toEqual(1);
  });
});
