import { edkt } from '../../../src';
import {
  clearStore,
  getMatchedAudiences,
  getPageViews,
} from '../../helpers/localStorage';
import {
  makeAudienceDefinition,
  makeCosineSimilarityQuery,
} from '../../helpers/audienceDefinitions';

describe('cosine similarity audiences matching behaviour', () => {
  const vectorOne = [1, 1, 1];
  const vectorTwo = [1, 0, 1];
  const notMatchingVector = [0, 1, 0];

  const cosineSimAudience = makeAudienceDefinition({
    occurrences: 1,
    definition: [
      makeCosineSimilarityQuery({
        queryValue: {
          threshold: 0.99,
          vector: vectorOne,
        },
      }),
    ],
  });

  const multiCosineSimAudience = makeAudienceDefinition({
    occurrences: 1,
    definition: [
      makeCosineSimilarityQuery({
        queryValue: {
          threshold: 0.99,
          vector: vectorOne,
        },
      }),
      makeCosineSimilarityQuery({
        queryValue: {
          threshold: 0.99,
          vector: vectorTwo,
        },
      }),
    ],
  });

  describe('cosine similarity with single query audiences', () => {
    const pageFeatures = {
      docVector: {
        value: vectorOne,
        version: 1,
      },
    };

    it('adds 1st page view and does not match on first run', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions: [cosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(1);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('adds 2nd page view and does match on second run', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions: [cosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(2);
      expect(getMatchedAudiences()).toHaveLength(1);
    });

    it('adds 3rd page view on third run', async () => {
      await edkt.run({
        pageFeatures: pageFeatures,
        audienceDefinitions: [cosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(3);
      expect(getMatchedAudiences()).toHaveLength(1);
    });
  });

  describe('cosine similarity multi query audiences matching above threshold', () => {
    const pageFeaturesMatchOne = {
      docVector: {
        value: vectorOne,
        version: 1,
      },
    };

    const pageFeaturesMatchTwo = {
      docVector: {
        value: vectorTwo,
        version: 1,
      },
    };

    beforeAll(clearStore);

    it('adds 1st page view and does not match on first run', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatchOne,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(1);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('adds 2nd page view and match second run', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatchTwo,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(2);
      expect(getMatchedAudiences()).toHaveLength(1);
    });

    it('adds 3rd page view third run', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesMatchOne,
        audienceDefinitions: [cosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(3);
      expect(getMatchedAudiences()).toHaveLength(1);
    });
  });

  describe('cosine similarity multi query audiences not matching below threshold', () => {
    const pageFeaturesNotMatch = {
      docVector: {
        value: notMatchingVector,
        version: 1,
      },
    };

    beforeAll(clearStore);

    it('adds 1st page view and does not match on first run', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesNotMatch,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(1);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('adds 2nd page view and does not match on second run', async () => {
      await edkt.run({
        pageFeatures: pageFeaturesNotMatch,
        audienceDefinitions: [multiCosineSimAudience],
        omitGdprConsent: true,
      });

      expect(getPageViews()).toHaveLength(2);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('adds 3rd page view and does not match on third run', async () => {
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
