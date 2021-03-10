import { evaluateCondition } from '../../../src/engine';
import {
  makeEngineCondition,
  makeTopicDistPageView,
} from '../../helpers/engineConditions';
import { makeCosineSimilarityQuery } from '../../helpers/audienceDefinitions';

describe('engine matching behaviour for cosine similarity condition', () => {
  describe('cosine similarity condition with same condition/pageView version', () => {
    const cosineSimilarityCondition = makeEngineCondition([
      makeCosineSimilarityQuery({
        queryValue: {
          vector: [0.4, 0.8, 0.3],
          threshold: 0.99,
        },
        featureVersion: 1,
      }),
    ]);

    it('does match the page view if vector similarity is above threshold', () => {
      const pageViews = [makeTopicDistPageView([0.4, 0.8, 0.3], 1)];

      const result = evaluateCondition(cosineSimilarityCondition, pageViews);

      expect(result).toEqual(true);
    });

    it('does not match the page view if similarity is not above threshold', () => {
      const pageViews = [
        makeTopicDistPageView([0.2, 0.8, 0.1], 1, 100),
        makeTopicDistPageView([0.3, 0.8, 0.1], 1, 101),
      ];

      const result = evaluateCondition(cosineSimilarityCondition, pageViews);

      expect(result).toEqual(false);
    });
  });

  describe('cosine similarity condition with a bumped featureVersion', () => {
    // Vector condition with a bumped featureVersion
    const cosineSimilarityCondition = makeEngineCondition([
      makeCosineSimilarityQuery({
        queryValue: {
          vector: [0.4, 0.8, 0.3],
          threshold: 0.99,
        },
        featureVersion: 2,
      }),
    ]);

    it('does match the page view if similarity is above threshold and has the same featureVersion', () => {
      const pageViews = [makeTopicDistPageView([0.4, 0.8, 0.3], 2, 100)];

      const result = evaluateCondition(cosineSimilarityCondition, pageViews);

      expect(result).toBe(true);
    });

    it('does not match the page view if similarity is above threshold but does not have the same featureVersion', () => {
      const pageViews = [makeTopicDistPageView([0.4, 0.8, 0.3], 1, 100)];

      const result = evaluateCondition(cosineSimilarityCondition, pageViews);

      expect(result).toBe(false);
    });
  });
});
