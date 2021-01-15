import { edkt } from '../../src';
import {
  clearStore,
  getMatchedAudiences,
  getPageViews,
} from '../helpers/localStorageSetup';
import {
  cosineSimAudience,
  multiCosineSimAudience,
} from '../helpers/audienceDefinitions';

describe('Cosine similarity based audiences', () => {
  describe('Cosine similarity single query audiences', () => {
    const pageFeatures = {
      dv: {
        value: [1, 1, 1],
        version: 1,
      },
    };

    it('Check page views are empty', () => {
      expect(getPageViews()).toHaveLength(0);
    });

    it('First run -> add 1st page view and do not match audience definition', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions: [cosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(1);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('Second run -> add 2nd page view and match audience definition', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions: [cosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(2);
      expect(getMatchedAudiences()).toHaveLength(1);
    });

    it('Third run -> add 3rd page view', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions: [cosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(3);
      expect(getMatchedAudiences()).toHaveLength(1);
    });
  });

  describe('Cosine similarity multi query audiences matches any', () => {
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

    beforeAll(clearStore);

    it('Check page views are empty', () => {
      expect(getPageViews()).toHaveLength(0);
    });

    it('First run -> add 1st page view and do not match audience definition', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatch0,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(1);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('Second run -> add 2nd page view and match audience definition', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatch1,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(2);
      expect(getMatchedAudiences()).toHaveLength(1);
    });

    it('Third run -> add 3rd page view', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatch0,
        audienceDefinitions: [cosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(3);
      expect(getMatchedAudiences()).toHaveLength(1);
    });
  });

  describe('Cosine similarity multi query audiences does not matches below threshold', () => {
    const pageFeaturesNotMatch = {
      dv: {
        value: [0, 1, 0],
        version: 1,
      },
    };

    beforeAll(clearStore);

    it('Check page views are empty', () => {
      expect(getPageViews()).toHaveLength(0);
    });

    it('First run -> add 1st page view and do not match audience definition', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesNotMatch,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(1);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('Second run -> add 2nd page view and match audience definition', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesNotMatch,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(2);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('Third run -> add 3rd page view', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesNotMatch,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(3);
      expect(getMatchedAudiences()).toHaveLength(0);
    });
  });
});
