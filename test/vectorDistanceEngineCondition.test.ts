import 'jest';
import { check } from '../src/engine';
import {
  EngineCondition,
  QueryFilterComparisonType,
  VectorDistanceFilter,
  PageView
} from '../types';
import { clearStore } from './helpers/localStorageSetup';

const vectorCondition: EngineCondition<VectorDistanceFilter> = {
  filter: {
    any: false,
    queries: [
      {
        featureVersion: 1,
        queryProperty: 'topicDist',
        queryFilterComparisonType: QueryFilterComparisonType.VECTOR_DISTANCE,
        queryValue: [{
          vector: [0.4, 0.8, 0.3],
          threshold: 0.5,
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
const vectorConditionV2: EngineCondition<VectorDistanceFilter> = {
  filter: {
    any: false,
    queries: [
      {
        featureVersion: 2,
        queryProperty: 'topicDist',
        queryFilterComparisonType: QueryFilterComparisonType.VECTOR_DISTANCE,
        queryValue: [{
          vector: [0.4, 0.8, 0.3],
          threshold: 0.5,
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

describe('Vector condition', () => {
  beforeAll(() => {
    clearStore()
  });

  it('matches the page view if vector similarity is above threshold', async () => {
    const conditions = [vectorCondition];

    const pageViews: PageView[] = [
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

  it('does not match the page view if similarity is not above threshold', async () => {
    const conditions = [vectorCondition];

    const pageViews: PageView[] = [
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

describe('Vector condition with a bumped featureVersion', () => {
  beforeAll(() => {
    clearStore()
  });

  it('matches the page view if similarity is above threshold and has the same featureVersion', async () => {
    const conditions = [vectorConditionV2];

    const pageViews: PageView[] = [
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

  it('does not match the page view if similar enough but does not have the same featureVersion', async () => {
    const conditions = [vectorConditionV2];

    const pageViews: PageView[] = [
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
