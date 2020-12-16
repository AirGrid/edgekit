import {
  AudienceDefinition,
  QueryFilterComparisonType,
  VectorQueryValue,
} from '../types';
import { edkt } from '../src';
import {
  clearStore,
  getMatchedAudiences,
  getPageViews,
} from './helpers/localStorageSetup';

const makeCosineSimAudience = (
  value: VectorQueryValue
): AudienceDefinition => ({
  lookBack: 2592000,
  occurrences: 1,
  ttl: 2592000,
  definition: [{
    featureVersion: 1,
    queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
    queryProperty: 'dv',
    queryValue: value,
  }],
  id: 'testid',
  name: 'cosineSimAudience',
  version: 1,
});

const cosineSimAudience = makeCosineSimAudience({
  threshold: 0.8,
  vector: [1, 1, 1],
});

const pageFeatures = {
  dv: {
    value: [1, 1, 1],
    version: 1,
  },
};

describe('Cosine similarity based audiences', () => {
  beforeAll(() => {
    clearStore();
  });

  it('Check page views are empty', () => {
    expect(getPageViews().length).toEqual(0);
  });

  it('First run -> add 1st page view and do not match audience definition', async () => {
    await edkt.run({
      pageFeatures: pageFeatures,
      audienceDefinitions: [cosineSimAudience],
      omitGdprConsent: true,
    });

    expect(getPageViews().length).toEqual(1);
    expect(getMatchedAudiences().length).toEqual(0);
  });

  it('Second run -> add 2nd page view and match audience definition', async () => {
    await edkt.run({
      pageFeatures: pageFeatures,
      audienceDefinitions: [cosineSimAudience],
      omitGdprConsent: true,
    });

    expect(getPageViews().length).toEqual(2);
    expect(getMatchedAudiences().length).toEqual(1);
  });

  it('Third run -> add 3rd page view', async () => {
    await edkt.run({
      pageFeatures: pageFeatures,
      audienceDefinitions: [cosineSimAudience],
      omitGdprConsent: true,
    });

    expect(getPageViews().length).toEqual(3);
    expect(getMatchedAudiences().length).toEqual(1);
  });
});
