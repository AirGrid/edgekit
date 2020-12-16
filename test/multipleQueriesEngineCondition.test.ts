import { check } from '../src/engine';
import {
  EngineCondition,
  QueryFilterComparisonType,
  CosineSimilarityFilter,
  PageView,
} from '../types';

const multipleSameTypeQueriesCondition: EngineCondition<CosineSimilarityFilter> = {
  filter: {
    queries: [
      {
        featureVersion: 1,
        queryProperty: 'topicDist',
        queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
        queryValue: [
          {
            vector: [1, 1, 1],
            threshold: 0.99,
          },
        ],
      },
      {
        featureVersion: 1,
        queryProperty: 'topicDist',
        queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
        queryValue: [
          {
            vector: [1, 0, 1],
            threshold: 0.99,
          },
        ],
      },
    ],
  },
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: 'ge',
        args: 1,
      },
    },
  ],
};

const makePageView = (value: number[], version: number): PageView[] => ([
  {
    ts: 100,
    features: {
      topicDist: {
        version,
        value,
      },
    },
  },
])

/* While doing this I noticed there is yet another degree of freedom
 * on the conditions.
 *
 * That is, the check can take multiple:
 * - conditions, directly on the conditions array parameter
 * - queries, where each condition can contain multiple of then
 * - queryValues, where each query can contain multiple of then
 *
 * If I'm not missing something, that is just redundancy.
 * When the condition parameters other than the cited are maintained
 * the tree compositions are equivalent over the result value
 *
 * I propose sticking with composition on the uppermost level
 * where the flexibility for choosing the other params is maintained
 *
 * Also, there is already a 'any' param implemented on the check method
 * which acts upon the uppermost composition.
 * WDYT?
 *
 * */
describe('Multiple EngineConditionQuery values test', () => {
  describe('Multiple CosineSimilarity filter conditions query', () => {
    it('matches for condition above threshold on fisrt query object', () => {
      const conditions = [multipleSameTypeQueriesCondition];
      const pageViews = makePageView([1, 1, 1], 1);
      const result = check(conditions, pageViews);
      expect(result).toEqual(true);
    });

    it('matches for condition above threshold on second query object', () => {
      const conditions = [multipleSameTypeQueriesCondition];
      const pageViews = makePageView([1, 0, 1], 1);
      const result = check(conditions, pageViews);
      expect(result).toEqual(true);
    });

    it('does not matches for condition below threshold on every query object', () => {
      const conditions = [multipleSameTypeQueriesCondition];
      const pageViews = makePageView([0, 1, 0], 1);
      const result = check(conditions, pageViews, true);
      expect(result).toEqual(false);
    });

    it('matches for condition above threshold on any pageView object - condition pair', () => {
      const conditions = [multipleSameTypeQueriesCondition];
      expect(check(
        conditions,
        [...makePageView([0, 1, 0], 1), ...makePageView([1, 0, 1], 1)],
      )).toEqual(true);
      expect(check(
        conditions,
        [...makePageView([1, 1, 1], 1), ...makePageView([0, 1, 0], 1)]
      )).toEqual(true);
    });

    it('does not matches for different condition - pageView versions', () => {
      const conditions = [multipleSameTypeQueriesCondition];
      const pageViews = makePageView([1, 1, 1], 2);
      const result = check(conditions, pageViews, true);
      expect(result).toEqual(false);
    });
  });
});
