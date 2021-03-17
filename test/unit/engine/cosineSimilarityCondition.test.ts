import { evaluateCondition } from '../../../src/engine';
import {
  makeEngineCondition,
  makePageView,
} from '../../helpers/engineConditions';
import { makeCosineSimilarityQuery } from '../../helpers/audienceDefinitions';

describe('engine matching behaviour for cosine similarity condition', () => {
  const matchingVector = [1, 1, 1];
  const notMatchingVector = [0, 0, 0];

  describe('cosine similarity condition with same condition/pageView version', () => {
    const cosineSimilarityCondition = makeEngineCondition({
      queries: [
        makeCosineSimilarityQuery({
          queryValue: {
            vector: matchingVector,
            threshold: 0.99,
          },
          featureVersion: 1,
        }),
      ],
    });

    it('does match the page view if vector similarity is above threshold', () => {
      const pageViews = [makePageView({ value: matchingVector, version: 1 })];

      const result = evaluateCondition(cosineSimilarityCondition, pageViews);

      expect(result).toEqual(true);
    });

    it('does not match the page view if similarity is not above threshold', () => {
      const pageViews = [
        makePageView({
          value: notMatchingVector,
          version: 1,
          ts: 100,
        }),
        makePageView({ value: notMatchingVector, version: 1, ts: 101 }),
      ];

      const result = evaluateCondition(cosineSimilarityCondition, pageViews);

      expect(result).toEqual(false);
    });
  });

  describe('cosine similarity condition with a bumped featureVersion', () => {
    // Vector condition with a bumped featureVersion
    const cosineSimilarityCondition = makeEngineCondition({
      queries: [
        makeCosineSimilarityQuery({
          queryValue: {
            vector: matchingVector,
            threshold: 0.99,
          },
          featureVersion: 2,
        }),
      ],
    });

    it('does match the page view if similarity is above threshold and has the same featureVersion', () => {
      const pageViews = [
        makePageView({ value: matchingVector, version: 2, ts: 100 }),
      ];

      const result = evaluateCondition(cosineSimilarityCondition, pageViews);

      expect(result).toBe(true);
    });

    it('does not match the page view if similarity is above threshold but does not have the same featureVersion', () => {
      const pageViews = [
        makePageView({ value: matchingVector, version: 1, ts: 100 }),
      ];

      const result = evaluateCondition(cosineSimilarityCondition, pageViews);

      expect(result).toBe(false);
    });
  });
});
