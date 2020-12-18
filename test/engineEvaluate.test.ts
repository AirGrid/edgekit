import { testables } from '../src/engine/evaluate';
import {
  makeEngineCondition,
  makeQuery,
  makePageView,
} from './helpers/engineConditions';
import { QueryFilterComparisonType } from '../types';

const { filterPageViews } = testables;

const multipleNonOverlappingQueriesCondition = makeEngineCondition(
  [
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
  ],
  1
);

const multipleOverlappingQueriesCondition = makeEngineCondition(
  [
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
  ],
  1
);

describe('Engine evaluate methods', () => {
  describe('filterPageViews behaviour for non overlapping queries audience definitions', () => {
    it('returns pageViews for condition above threshold', () => {
      const condition = multipleOverlappingQueriesCondition;
      expect(
        filterPageViews(condition.filter, [makePageView([1, 0, 0], 1)])
      ).toHaveLength(1);
      expect(
        filterPageViews(condition.filter, [makePageView([0, 1, 0], 1)])
      ).toHaveLength(1);
      expect(
        filterPageViews(condition.filter, [
          makePageView([1, 0, 0], 1),
          makePageView([0, 1, 0], 1),
        ])
      ).toHaveLength(2);
    });

    it('filters off pageViews for condition below threshold', () => {
      const condition = multipleNonOverlappingQueriesCondition;
      expect(
        filterPageViews(condition.filter, [
          makePageView([0, 0, 1], 1),
          makePageView([1, 1, 1], 1),
          makePageView([1, 1, 0], 1),
          makePageView([0, 1, 1], 1),
        ])
      ).toHaveLength(0);
      expect(
        filterPageViews(condition.filter, [
          makePageView([1, 0, 0], 1), // this matches
          makePageView([1, 1, 1], 1),
          makePageView([1, 1, 0], 1),
          makePageView([0, 1, 1], 1),
        ])
      ).toHaveLength(1);
      expect(
        filterPageViews(condition.filter, [
          makePageView([1, 0, 0], 1), // this matches
          makePageView([0, 1, 0], 1), // this matches
          makePageView([1, 1, 0], 1),
          makePageView([0, 1, 1], 1),
        ])
      ).toHaveLength(2);
    });
  });

  describe('filterPageViews behaviour for overlapping queries audience definitions', () => {
    it('returns matching pageViews exactly once', () => {
      const condition = multipleOverlappingQueriesCondition;
      expect(
        filterPageViews(condition.filter, [makePageView([1, 1, 0], 1)])
      ).toHaveLength(1);
      expect(
        filterPageViews(condition.filter, [makePageView([0, 1, 0], 1)])
      ).toHaveLength(1);
      expect(
        filterPageViews(condition.filter, [
          makePageView([1, 1, 0], 1),
          makePageView([0, 1, 0], 1),
        ])
      ).toHaveLength(2);
    });

    it('does not returns any pageView if no condition above threshold', () => {
      const condition = multipleOverlappingQueriesCondition;
      expect(
        filterPageViews(condition.filter, [makePageView([0, 0, 1], 1)])
      ).toHaveLength(0);
    });
  });
});
