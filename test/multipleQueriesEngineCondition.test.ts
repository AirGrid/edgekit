import { check } from '../src/engine';
import {
  makeEngineCondition,
  makeQuery,
  makePageView,
} from './helpers/engineConditions';
import { QueryFilterComparisonType } from '../types';

const multipleOrthogonalQueriesCondition = makeEngineCondition(
  [
    makeQuery(
      {
        vector: [0, 1, 0],
        threshold: 0.99,
      },
      1,
      QueryFilterComparisonType.COSINE_SIMILARITY
    ),
    makeQuery(
      {
        vector: [1, 0, 0],
        threshold: 0.99,
      },
      1,
      QueryFilterComparisonType.COSINE_SIMILARITY
    ),
  ],
  1
);

describe('Multiple EngineConditionQuery values test', () => {
  describe('Multiple CosineSimilarity filter conditions query', () => {
    it('matches for condition above threshold on fisrt query object', () => {
      const conditions = [multipleOrthogonalQueriesCondition];
      const pageViews = [makePageView([1, 0, 0], 1)];
      const result = check(conditions, pageViews);
      expect(result).toEqual(true);
    });

    it('matches for condition above threshold on second query object', () => {
      const conditions = [multipleOrthogonalQueriesCondition];
      const pageViews = [makePageView([0, 1, 0], 1)];
      const result = check(conditions, pageViews);
      expect(result).toEqual(true);
    });

    it('does not matches for condition below threshold on every query object', () => {
      const conditions = [multipleOrthogonalQueriesCondition];
      const pageViews = [makePageView([0, 0, 1], 1)];
      const result = check(conditions, pageViews);
      expect(result).toEqual(false);
    });

    it('matches for condition above threshold on at least one (pageView, condition) pair', () => {
      const conditions = [multipleOrthogonalQueriesCondition];
      expect(
        check(conditions, [
          makePageView([1, 0, 0], 1),
          makePageView([0, 0, 1], 1),
        ])
      ).toEqual(true);
      expect(
        check(conditions, [
          makePageView([0, 1, 0], 1),
          makePageView([0, 0, 1], 1),
        ])
      ).toEqual(true);
    });

    it('does not matches for different (condition, pageView) versions attributes', () => {
      const conditions = [multipleOrthogonalQueriesCondition];
      const pageViews = [
        makePageView([1, 0, 0], 2),
        makePageView([0, 1, 0], 2),
        makePageView([0, 0, 1], 2),
        makePageView([1, 1, 1], 2),
      ];
      const result = check(conditions, pageViews);
      expect(result).toEqual(false);
    });

    it('successfully matches for mixed versions/conditions', () => {
      const conditions = [multipleOrthogonalQueriesCondition];
      const pageViews = [
        makePageView([1, 0, 0], 1),
        makePageView([0, 1, 0], 2),
        makePageView([0, 0, 1], 2),
        makePageView([1, 1, 1], 2),
      ];
      const result = check(conditions, pageViews);
      expect(result).toEqual(true);
    });
  });
});
