import { evaluateCondition } from '../../../src/engine';
import {
  makeEngineCondition,
  makePageView,
} from '../../helpers/engineConditions';
import { makeLogisticRegressionQuery } from '../../helpers/audienceDefinitions';

describe('engine matching behaviour for logistic regression condition', () => {
  const matchingVector = [1, 1, 1];
  const notMatchingVector = [0, 0, 0];

  describe('logReg condition with same condition/pageView version', () => {
    const versionOneCondition = makeEngineCondition({
      queries: [
        makeLogisticRegressionQuery({
          queryValue: {
            vector: matchingVector,
            threshold: 0.9,
            bias: 0,
          },
          featureVersion: 1,
        }),
      ],
    });

    it('does match the page view if vector similarity is above threshold', () => {
      const pageViews = [
        makePageView({
          value: matchingVector,
          version: 1,
          queryProperty: 'docVector',
        }),
      ];

      const result = evaluateCondition(versionOneCondition, pageViews);

      expect(result).toEqual(true);
    });

    it('does not match the page view if similarity is not above threshold', () => {
      const pageViews = [
        makePageView({
          value: notMatchingVector,
          version: 1,
          ts: 100,
          queryProperty: 'docVector',
        }),
        makePageView({
          value: notMatchingVector,
          version: 1,
          ts: 101,
          queryProperty: 'docVector',
        }),
      ];

      const result = evaluateCondition(versionOneCondition, pageViews);

      expect(result).toEqual(false);
    });
  });

  describe('logRef condition with a bumped featureVersion', () => {
    // Vector condition with a bumped featureVersion
    const versionTwoCondition = makeEngineCondition({
      queries: [
        makeLogisticRegressionQuery({
          queryValue: {
            vector: matchingVector,
            threshold: 0.9,
            bias: 0,
          },
          featureVersion: 2,
        }),
      ],
    });

    it('does match the page view if similarity is above threshold and has the same featureVersion', () => {
      const pageViews = [
        makePageView({
          value: matchingVector,
          version: 2,
          ts: 100,
          queryProperty: 'docVector',
        }),
      ];

      const result = evaluateCondition(versionTwoCondition, pageViews);

      expect(result).toBe(true);
    });

    it('does not match the page view if similarity is above threshold but does not have the same featureVersion', () => {
      const pageViews = [
        makePageView({
          value: matchingVector,
          version: 1,
          ts: 100,
          queryProperty: 'docVector',
        }),
      ];

      const result = evaluateCondition(versionTwoCondition, pageViews);

      expect(result).toBe(false);
    });
  });
});
