import {
  AudienceDefinition,
  QueryFilterComparisonType,
  AudienceQueryDefinition,
  VectorQueryValue,
} from '../types';
import { edkt } from '../src';
import {
  clearStore,
  getMatchedAudiences,
  getPageViews,
} from './helpers/localStorageSetup';

const makeCosineSimAudience = (
  definition: AudienceQueryDefinition[]
): AudienceDefinition => ({
  lookBack: 2592000,
  occurrences: 1,
  ttl: 2592000,
  definition,
  id: 'testid',
  // name: 'cosineSimAudience',
  version: 1,
});

const makeCosineSimQuery = (
  queryValue: VectorQueryValue
): AudienceQueryDefinition => ({
  featureVersion: 1,
  queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
  queryProperty: 'dv',
  queryValue,
});

const cosineSimAudience = makeCosineSimAudience([
  makeCosineSimQuery({
    threshold: 0.8,
    vector: [1, 1, 1],
  }),
]);

const multiCosineSimAudience = makeCosineSimAudience([
  makeCosineSimQuery({
    threshold: 0.99,
    vector: [1, 1, 1],
  }),
  makeCosineSimQuery({
    threshold: 0.99,
    vector: [1, 0, 1],
  }),
]);

/* These tests will improve soon */
describe('Cosine similarity based audiences', () => {
  describe('Cosine similarity single query audiences', () => {
    beforeAll(() => {
      clearStore();
    });

    const pageFeatures = {
      dv: {
        value: [1, 1, 1],
        version: 1,
      },
    };

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

  describe('Cosine similarity multi query audiences matches any', () => {
    beforeAll(() => {
      clearStore();
    });

    const pageFeaturesMatch0 = {
      dv: {
        value: [1, 1, 1],
        version: 1,
      },
    };

    const pageFeaturesMatch1 = {
      dv: {
        value: [1, 0, 1],
        version: 1,
      },
    };

    it('Check page views are empty', () => {
      expect(getPageViews().length).toEqual(0);
    });

    it('First run -> add 1st page view and do not match audience definition', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatch0,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews().length).toEqual(1);
      expect(getMatchedAudiences().length).toEqual(0);
    });

    it('Second run -> add 2nd page view and match audience definition', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatch1,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews().length).toEqual(2);
      expect(getMatchedAudiences().length).toEqual(1);
    });

    it('Third run -> add 3rd page view', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatch0,
        audienceDefinitions: [cosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews().length).toEqual(3);
      expect(getMatchedAudiences().length).toEqual(1);
    });
  });

  describe('Cosine similarity multi query audiences does not matches below threshold', () => {
    beforeAll(() => {
      clearStore();
    });

    const pageFeaturesNotMatch = {
      dv: {
        value: [0, 1, 0],
        version: 1,
      },
    };

    it('Check page views are empty', () => {
      expect(getPageViews().length).toEqual(0);
    });

    it('First run -> add 1st page view and do not match audience definition', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesNotMatch,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews().length).toEqual(1);
      expect(getMatchedAudiences().length).toEqual(0);
    });

    it('Second run -> add 2nd page view and match audience definition', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesNotMatch,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews().length).toEqual(2);
      expect(getMatchedAudiences().length).toEqual(0);
    });

    it('Third run -> add 3rd page view', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesNotMatch,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews().length).toEqual(3);
      expect(getMatchedAudiences().length).toEqual(0);
    });
  });
});
