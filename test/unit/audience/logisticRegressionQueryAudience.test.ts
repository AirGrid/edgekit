import { edkt } from '../../../src';
import {
  clearStore,
  getMatchedAudiences,
  getPageViews,
} from '../../helpers/localStorage';
import {
  logRegAudience,
  multiLogRegAudience,
} from '../../helpers/audienceDefinitions';

describe('logistic regression audiences matching behaviour', () => {
  describe('logistic regression with single query audiences', () => {
    const pageFeatures = {
      docVector: {
        value: [1, 1, 1],
        version: 1,
      },
    };

    it('adds 1st page view and does not match on first run', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions: [logRegAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(1);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('adds 2nd page view and does match on second run', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions: [logRegAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(2);
      expect(getMatchedAudiences()).toHaveLength(1);
    });

    it('adds 3rd page view on third run', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions: [logRegAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(3);
      expect(getMatchedAudiences()).toHaveLength(1);
    });
  });

  describe('logistic regression multi query audiences matching above threshold', () => {
    const pageFeaturesMatch0 = {
      docVector: {
        value: [1, 1, 1],
        version: 1,
      },
    };

    const pageFeaturesMatch1 = {
      docVector: {
        value: [1, 0, 1],
        version: 1,
      },
    };

    beforeAll(clearStore);

    it('adds 1st page view and does not match on first run', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatch0,
        audienceDefinitions: [multiLogRegAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(1);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('adds 2nd page view and match second run', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatch1,
        audienceDefinitions: [multiLogRegAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(2);
      expect(getMatchedAudiences()).toHaveLength(1);
    });

    it('adds 3rd page view third run', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatch0,
        audienceDefinitions: [logRegAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(3);
      expect(getMatchedAudiences()).toHaveLength(1);
    });
  });

  describe('logistic regression multi query audiences not matching below threshold', () => {
    const pageFeaturesNotMatch = {
      docVector: {
        value: [0, 1, 0],
        version: 1,
      },
    };

    beforeAll(clearStore);

    it('adds 1st page view and does not match on first run', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesNotMatch,
        audienceDefinitions: [multiLogRegAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(1);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('adds 2nd page view and does not match on second run', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesNotMatch,
        audienceDefinitions: [multiLogRegAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(2);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('adds 3rd page view and does not match on third run', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesNotMatch,
        audienceDefinitions: [multiLogRegAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(3);
      expect(getMatchedAudiences()).toHaveLength(0);
    });
  });
});
