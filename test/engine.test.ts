import 'jest';
import { check } from '../src/engine';
import { EngineCondition, StringArrayComparasionTypes, VectorQueryComparasionTypes } from '../types';

const sports1xConditionGt: EngineCondition = {
  filter: {
    any: false,
    queries: [
      {
        version: 1,
        property: 'keywords',
        filterComparisonType: StringArrayComparasionTypes.arrayIntersects as StringArrayComparasionTypes,
        value: ['sport'],
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

const sports1xConditionLt: EngineCondition = {
  filter: {
    any: false,
    queries: [
      {
        version: 1,
        property: 'keywords',
        filterComparisonType: StringArrayComparasionTypes.arrayIntersects as StringArrayComparasionTypes,
        value: ['sport'],
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

const sports1xConditionEq: EngineCondition = {
  filter: {
    any: false,
    queries: [
      {
        version: 1,
        property: 'keywords',
        filterComparisonType: StringArrayComparasionTypes.arrayIntersects as StringArrayComparasionTypes,
        value: ['sport'],
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

const sports1xConditionGe: EngineCondition = {
  filter: {
    any: false,
    queries: [
      {
        version: 1,
        property: 'keywords',
        filterComparisonType: StringArrayComparasionTypes.arrayIntersects as StringArrayComparasionTypes,
        value: ['sport'],
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

const sports1xConditionLe: EngineCondition = {
  filter: {
    any: false,
    queries: [
      {
        version: 1,
        property: 'keywords',
        filterComparisonType: StringArrayComparasionTypes.arrayIntersects as StringArrayComparasionTypes,
        value: ['sport'],
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

const vectorCondition: EngineCondition = {
  filter: {
    any: false,
    queries: [
      {
        version: 1,
        property: 'topicDist',
        filterComparisonType: VectorQueryComparasionTypes.vectorDistance as VectorQueryComparasionTypes,
        value: {
          vector: [0.4, 0.8, 0.3],
          threshold: 0.5,
        },
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

// Vector condition with a bumped version
const vectorConditionV2: EngineCondition = {
  filter: {
    any: false,
    queries: [
      {
        version: 2,
        property: 'topicDist',
        filterComparisonType: VectorQueryComparasionTypes.vectorDistance as VectorQueryComparasionTypes,
        value: {
          vector: [0.4, 0.8, 0.3],
          threshold: 0.5,
        },
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

describe('Engine test', () => {
  describe('Sports condition', () => {
    it('evaluates first model with gt matcher', async () => {
      const conditions = [sports1xConditionGt];

      const pageViews = [
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

      const pageViews = [
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

      const pageViews = [
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

      const pageViews = [
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

      const pageViews2 = [
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

      const pageViews = [
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

      const pageViews2 = [
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

      const pageViews = [
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

      const pageViews2 = [
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

  describe('Vector condition', () => {
    it('matches the page view if similar enough', async () => {
      const conditions = [vectorCondition];

      const pageViews = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 1,
              value: [0.2, 0.5, 0.1],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(true);
    });

    it('does not match the page view if not similar enough', async () => {
      const conditions = [vectorCondition];

      const pageViews = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 1,
              value: [0.3, 0.2, 0.1],
            },
          },
        },
        {
          ts: 101,
          features: {
            topicDist: {
              version: 1,
              value: [0.3, 0.2, 0.2],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toEqual(false);
    });
  });

  describe('Vector condition with a bumped version', () => {
    it('matches the page view if similar enough and has the same version', async () => {
      const conditions = [vectorConditionV2];

      const pageViews = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 2,
              value: [0.2, 0.5, 0.1],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toBe(true);
    });

    it('does not match the page view if similar enough but does not have the same version', async () => {
      const conditions = [vectorConditionV2];

      const pageViews = [
        {
          ts: 100,
          features: {
            topicDist: {
              version: 1,
              value: [0.2, 0.5, 0.1],
            },
          },
        },
      ];

      const result = check(conditions, pageViews);

      expect(result).toBe(false);
    });
  });
});
