import 'jest';
import { check } from '../src/engine';
import {
  EngineCondition,
  QueryFilterComparisonType,
  ArrayIntersectsFilter,
  PageView
} from '../types';

const sports1xConditionGt: EngineCondition<ArrayIntersectsFilter> = {
  filter: {
    any: false,
    queries: [
      {
        featureVersion: 1,
        queryProperty: 'keywords',
        queryFilterComparisonType: QueryFilterComparisonType.ARRAY_INTERSECTS,
        queryValue: ['sport'],
      },
    ],
  },
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: 'gt',
        args: 1,
      },
    },
  ],
};

const sports1xConditionLt: EngineCondition<ArrayIntersectsFilter> = {
  filter: {
    any: false,
    queries: [
      {
        featureVersion: 1,
        queryProperty: 'keywords',
        queryFilterComparisonType: QueryFilterComparisonType.ARRAY_INTERSECTS,
        queryValue: ['sport'],
      },
    ],
  },
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: 'lt',
        args: 1,
      },
    },
  ],
};

const sports1xConditionEq: EngineCondition<ArrayIntersectsFilter> = {
  filter: {
    any: false,
    queries: [
      {
        featureVersion: 1,
        queryProperty: 'keywords',
        queryFilterComparisonType: QueryFilterComparisonType.ARRAY_INTERSECTS,
        queryValue: ['sport'],
      },
    ],
  },
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: 'eq',
        args: 1,
      },
    },
  ],
};

const sports1xConditionGe: EngineCondition<ArrayIntersectsFilter> = {
  filter: {
    any: false,
    queries: [
      {
        featureVersion: 1,
        queryProperty: 'keywords',
        queryFilterComparisonType: QueryFilterComparisonType.ARRAY_INTERSECTS,
        queryValue: ['sport'],
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

const sports1xConditionLe: EngineCondition<ArrayIntersectsFilter> = {
  filter: {
    any: false,
    queries: [
      {
        featureVersion: 1,
        queryProperty: 'keywords',
        queryFilterComparisonType: QueryFilterComparisonType.ARRAY_INTERSECTS,
        queryValue: ['sport'],
      },
    ],
  },
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: 'le',
        args: 1,
      },
    },
  ],
};

describe('Engine test', () => {
  describe('Sports condition', () => {
    it('evaluates first model with gt matcher', async () => {
      const conditions = [sports1xConditionGt];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            keywords: {
              version: 1,
              value: ['sport', 'football'],
            },
          },
        },
        {
          ts: 101,
          features: {
            keywords: {
              version: 1,
              value: ['sport', 'football'],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(true);
    });

    it('evaluates first model with lt matcher', async () => {
      const conditions = [sports1xConditionLt];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            keywords: {
              version: 1,
              value: ['test', 'test2'],
            },
          },
        },
        {
          ts: 101,
          features: {
            keywords: {
              version: 1,
              value: ['test', 'test2'],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(true);
    });

    it('evaluates first model with eq matcher', async () => {
      const conditions = [sports1xConditionEq];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            keywords: {
              version: 1,
              value: ['sport', 'football'],
            },
          },
        },
        {
          ts: 101,
          features: {
            keywords: {
              version: 1,
              value: ['test', 'test2'],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(true);
    });

    it('evaluates first model with ge matcher', async () => {
      const conditions = [sports1xConditionGe];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            keywords: {
              version: 1,
              value: ['sport', 'football'],
            },
          },
        },
        {
          ts: 101,
          features: {
            keywords: {
              version: 1,
              value: ['test', 'test2'],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(true);

      const pageViews2: PageView[] = [
        {
          ts: 100,
          features: {
            keywords: {
              version: 1,
              value: ['sport', 'football'],
            },
          },
        },
        {
          ts: 101,
          features: {
            keywords: {
              version: 1,
              value: ['sport', 'football'],
            },
          },
        },
      ];

      const result2 = check(conditions, pageViews2);

      expect(result2).toEqual(true);
    });

    it('evaluates first model with le matcher', async () => {
      const conditions = [sports1xConditionLe];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            keywords: {
              version: 1,
              value: ['test', 'test2'],
            },
          },
        },
        {
          ts: 101,
          features: {
            keywords: {
              version: 1,
              value: ['test', 'test2'],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(true);

      const pageViews2: PageView[] = [
        {
          ts: 100,
          features: {
            keywords: {
              version: 1,
              value: ['sport', 'football'],
            },
          },
        },
        {
          ts: 101,
          features: {
            keywords: {
              version: 1,
              value: ['test', 'test2'],
            },
          },
        },
      ];

      const result2 = check(conditions, pageViews2);

      expect(result2).toEqual(true);
    });

    it('evaluates first model with a false match', async () => {
      const conditions = [sports1xConditionGt];

      const pageViews: PageView[] = [
        {
          ts: 100,
          features: {
            keywords: {
              version: 1,
              value: ['test', 'test2'],
            },
          },
        },
        {
          ts: 101,
          features: {
            keywords: {
              version: 1,
              value: ['test', 'test2'],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(false);

      const pageViews2: PageView[] = [
        {
          ts: 100,
          features: {
            keywords: {
              version: 1,
              value: ['sport', 'football'],
            },
          },
        },
        {
          ts: 101,
          features: {
            keywords: {
              version: 1,
              value: ['test', 'test2'],
            },
          },
        },
      ];

      const result2 = check(conditions, pageViews2);

      expect(result2).toEqual(false);
    });
  });
});
