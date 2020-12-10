import { check } from '../src/engine';
import {
  EngineCondition,
  QueryFilterComparisonType,
  CosineSimilarityFilter,
  PageView
} from '../types';

/* TODO queryProperty based tests for engine behaviors
*/
const cosineSimilarityCondition: EngineCondition<CosineSimilarityFilter> = {
  filter: {
    any: false,
    queries: [
      {
        featureVersion: 1,
        queryProperty: 'topicDist',
        queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
        queryValue: [{
          vector: [0.4, 0.8, 0.3],
          threshold: 0.99,
        }],
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

const multipleCosineSimilarityCondition: EngineCondition<CosineSimilarityFilter> = {
  filter: {
    any: false,
    queries: [
      {
        featureVersion: 1,
        queryProperty: 'topicDist',
        queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
        queryValue: [{
          vector: [0.4, 0.8, 0.3],
          threshold: 0.99,
        },
        {
          vector: [0.1, 0.2, 0.1],
          threshold: 0.99,
        }],
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


// Vector condition with a bumped featureVersion
const cosineSimilarityConditionV2: EngineCondition<CosineSimilarityFilter> = {
  filter: {
    any: false,
    queries: [
      {
        featureVersion: 2,
        queryProperty: 'topicDist',
        queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
        queryValue: [{
          vector: [0.4, 0.8, 0.3],
          threshold: 0.99,
        }],
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

describe('Cosine Similarity condition test', () => {
  beforeAll(() => {
    localStorage.clear();
  });

  describe('Cosine Similarity condition', () => {
    it('matches the page view if similar enough', () => {
      const conditions = [cosineSimilarityCondition];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 1,
              value: [0.4, 0.8, 0.3],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(true);
    });

    it('does not match the page view if not similar enough', () => {
      const conditions = [cosineSimilarityCondition];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 1,
              value: [0.2, 0.8, 0.1],
            },
          },
        },
        {
          ts: 101,
          features: {
            topicDist: {
              version: 1,
              value: [0.3, 0.8, 0.1],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(false);
    });
  });

  describe('Cosine Similarity condition with a bumped featureVersion', () => {
    it('matches the page view if similar enough and has the same featureVersion', () => {
      const conditions = [cosineSimilarityConditionV2];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 2,
              value: [0.4, 0.8, 0.3],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toBe(true);
    });

    it('does not match the page view if similar enough but does not have the same featureVersion', () => {
      const conditions = [cosineSimilarityConditionV2];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 1,
              value: [0.4, 0.8, 0.3],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toBe(false);
    });
  });

  describe('Cosine Similarity Condition with multiple audience vectors', () => {
    it('matches the page view if similar enough with any audience vector', () => {
      const conditions = [multipleCosineSimilarityCondition];

      const pageViewsV0: PageView[] = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 1,
              value: [0.4, 0.8, 0.3],
            },
          },
        },
      ];

      expect(check(conditions, pageViewsV0)).toEqual(true);

      const pageViewsV1: PageView[] = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 1,
              value: [0.1, 0.2, 0.1],
            },
          },
        },
      ];

      expect(check(conditions, pageViewsV1)).toEqual(true);

    });

    it('matches the page views if similar enough with all audience vector', () => {
      const conditions = [multipleCosineSimilarityCondition];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 1,
              value: [0.4, 0.8, 0.3],
            },
          },
        },
        {
          ts: 101,
          features: {
            topicDist: {
              version: 1,
              value: [0.1, 0.2, 0.1],
            },
          },
        },
      ];

      expect(check(conditions, pageViews)).toEqual(true);

    });

    it('does not match the page view if not similar enough', () => {
      const conditions = [cosineSimilarityCondition];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 1,
              value: [0.2, 0.8, 0.1],
            },
          },
        },
        {
          ts: 101,
          features: {
            topicDist: {
              version: 1,
              value: [0.3, 0.8, 0.1],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(false);

    });
  })
});
