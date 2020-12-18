import { testables } from '../src/engine/evaluate';
import { makeEngineCondition, makeQuery, makePageView } from './helpers/engineConditions';
import {
  QueryFilterComparisonType,
} from '../types';

const { filterPageViews } = testables;

const multipleOrthogonalQueriesCondition =
  makeEngineCondition([
  makeQuery(
    {
      vector: [1, 0, 0],
      threshold: 0.99,
    },
    1,
    QueryFilterComparisonType.COSINE_SIMILARITY
  ),
  makeQuery(
    {
      vector: [0, 1, 0],
      threshold: 0.99,
    },
    1,
    QueryFilterComparisonType.COSINE_SIMILARITY
  ),
], 1);

const multipleLinearlyDependentQueriesCondition =
  makeEngineCondition([
  makeQuery(
    {
      vector: [1, 1, 0],
      threshold: 0.5,
    },
    1,
    QueryFilterComparisonType.COSINE_SIMILARITY
  ),
  makeQuery(
    {
      vector: [1, 0, 0],
      threshold: 0.5,
    },
    1,
    QueryFilterComparisonType.COSINE_SIMILARITY
  ),
], 1);

describe('Engine evaluate methods', () => {
  describe('filterPageViews behaviour for Orthogonal audience definitions', () => {
    // def
    // [1,0,0], 0.99
    // [0,1,0], 0.99
    it('returns pageViews for conditions above threshold', () => {
      const conditions = multipleOrthogonalQueriesCondition;
      expect(
        filterPageViews(
          conditions.filter,
          [makePageView([1, 0, 0], 1)]
        )
      ).toHaveLength(1);
      expect(
        filterPageViews(
          conditions.filter,
          [makePageView([0, 1, 0], 1)]
        )
      ).toHaveLength(1);
      expect(
        filterPageViews(
          conditions.filter,
          [
            makePageView([1, 0, 0], 1),
            makePageView([0, 1, 0], 1),
          ]
        )
      ).toHaveLength(2);
    });

    it('filters off pageViews for conditions below threshold', () => {
      const conditions = multipleOrthogonalQueriesCondition;
      expect(
        filterPageViews(
          conditions.filter,
          [
            makePageView([0, 0, 1], 1),
            makePageView([1, 1, 1], 1),
            makePageView([1, 1, 0], 1),
            makePageView([0, 1, 1], 1),
          ]
        )
      ).toHaveLength(0);
      expect(
        filterPageViews(
          conditions.filter,
          [
            makePageView([1, 0, 0], 1), // this matches
            makePageView([1, 1, 1], 1),
            makePageView([1, 1, 0], 1),
            makePageView([0, 1, 1], 1),
          ]
        )
      ).toHaveLength(1);
      expect(
        filterPageViews(
          conditions.filter,
          [
            makePageView([1, 0, 0], 1), // this matches
            makePageView([0, 1, 0], 1), // this matches
            makePageView([1, 1, 0], 1),
            makePageView([0, 1, 1], 1),
          ]
        )
      ).toHaveLength(2);
    });
  });

  describe('filterPageViews behaviour for linerly dependent audience definitions', () => {
    // def
    // [1,1,0], 0.5
    // [0,1,0], 0.5
    it('returns matching pageViews exactly once', () => {
      const conditions = multipleLinearlyDependentQueriesCondition;
      expect(
        filterPageViews(
          conditions.filter,
          [makePageView([1, 1, 0], 1)]
        )
      ).toHaveLength(1);
      expect(
        filterPageViews(
          conditions.filter,
          [makePageView([0, 1, 0], 1)]
        )
      ).toHaveLength(1);
      expect(
        filterPageViews(
          conditions.filter,
          [
            makePageView([1, 1, 0], 1),
            makePageView([0, 1, 0], 1),
          ]
        )
      ).toHaveLength(2);
    });

    it('does not returns any pageView if no conditions above threshold', () => {
      const conditions = multipleLinearlyDependentQueriesCondition;
      expect(
        filterPageViews(
          conditions.filter,
          [ makePageView([0, 0, 1], 1) ]
        )
      ).toHaveLength(0);
    });

  });
});
