import { check } from '../../../src/engine';
import {
  makeEngineCondition,
  makeTopicDistPageView,
} from '../../helpers/engineConditions';
import { makeVectorDistanceQuery } from '../../helpers/audienceDefinitions';

describe('engine matching behaviour for vector distance condition', () => {
  describe('vector distance condition with same condition/pageView version', () => {
    const vectorCondition = makeEngineCondition([
      makeVectorDistanceQuery(
        {
          vector: [0.4, 0.8, 0.3],
          threshold: 0.5,
        },
        1
      ),
    ]);

    it('does match the page view if vector similarity is above threshold', async () => {
      const conditions = [vectorCondition];
      const pageViews = [makeTopicDistPageView([0.2, 0.5, 0.1], 1, 100)];

      const result = check(conditions, pageViews);

      expect(result).toEqual(true);
    });

    it('does not match the page view if similarity is not above threshold', async () => {
      const conditions = [vectorCondition];
      const pageViews = [
        makeTopicDistPageView([0.3, 0.2, 0.1], 1, 100),
        makeTopicDistPageView([0.3, 0.2, 0.2], 1, 101),
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(false);
    });
  });

  describe('vector condition with a bumped featureVersion', () => {
    // Vector condition with a bumped featureVersion
    const vectorCondition = makeEngineCondition([
      makeVectorDistanceQuery(
        {
          vector: [0.4, 0.8, 0.3],
          threshold: 0.5,
        },
        2
      ),
    ]);

    it('does match the page view if similarity is above threshold and has the same featureVersion', async () => {
      const conditions = [vectorCondition];
      const pageViews = [makeTopicDistPageView([0.2, 0.5, 0.1], 2, 100)];

      const result = check(conditions, pageViews);

      expect(result).toBe(true);
    });

    it('does not match the page view if similar enough but does not have the same featureVersion', async () => {
      const conditions = [vectorCondition];
      const pageViews = [makeTopicDistPageView([0.2, 0.5, 0.1], 1, 100)];

      const result = check(conditions, pageViews);

      expect(result).toBe(false);
    });
  });
});
