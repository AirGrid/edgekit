import { evaluateCondition } from '../../../src/engine';
import {
  makeEngineCondition,
  makeDocVectorPageView,
} from '../../helpers/engineConditions';
import { makeLogisticRegressionQuery } from '../../helpers/audienceDefinitions';

describe('engine matching behaviour for logistic regression condition', () => {
  describe('logReg condition with same condition/pageView version', () => {
    const versionOneCondition = makeEngineCondition([
      makeLogisticRegressionQuery({
        queryValue: {
          vector: [1, 1, 1],
          threshold: 0.9,
          bias: 0,
        },
        featureVersion: 1,
      }),
    ]);

    it('does match the page view if vector similarity is above threshold', () => {
      const pageViews = [makeDocVectorPageView([1, 1, 1], 1)];

      const result = evaluateCondition(versionOneCondition, pageViews);

      expect(result).toEqual(true);
    });

    it('does not match the page view if similarity is not above threshold', () => {
      const pageViews = [
        makeDocVectorPageView([0.2, 0.8, 0.1], 1, 100),
        makeDocVectorPageView([0.3, 0.8, 0.1], 1, 101),
      ];

      const result = evaluateCondition(versionOneCondition, pageViews);

      expect(result).toEqual(false);
    });
  });

  describe('logRef condition with a bumped featureVersion', () => {
    // Vector condition with a bumped featureVersion
    const versionTwoCondition = makeEngineCondition([
      makeLogisticRegressionQuery({
        queryValue: {
          vector: [1, 1, 1],
          threshold: 0.9,
          bias: 0,
        },
        featureVersion: 2,
      }),
    ]);

    it('does match the page view if similarity is above threshold and has the same featureVersion', () => {
      const pageViews = [makeDocVectorPageView([1, 1, 1], 2, 100)];

      const result = evaluateCondition(versionTwoCondition, pageViews);

      expect(result).toBe(true);
    });

    it('does not match the page view if similarity is above threshold but does not have the same featureVersion', () => {
      const pageViews = [makeDocVectorPageView([0.4, 0.8, 0.3], 1, 100)];

      const result = evaluateCondition(versionTwoCondition, pageViews);

      expect(result).toBe(false);
    });
  });
});
