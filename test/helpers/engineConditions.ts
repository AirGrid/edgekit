import {
  EngineCondition,
  EngineConditionQuery,
  QueryFilterComparisonType,
  PageView,
  VectorQueryValue,
  AudienceQueryDefinition,
} from '../../types';

export const makeQuery = <T extends AudienceQueryDefinition>(
  queryValue: VectorQueryValue,
  featureVersion: number,
  queryFilterComparisonType: QueryFilterComparisonType
): EngineConditionQuery<T> =>
  ({
    featureVersion,
    queryProperty: 'topicDist',
    queryFilterComparisonType,
    queryValue,
  } as EngineConditionQuery<T>);

export const makeEngineCondition = <T extends AudienceQueryDefinition>(
  queries: EngineConditionQuery<T>[],
  occurences: number
): EngineCondition<T> => ({
  filter: { queries },
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: 'ge',
        args: occurences,
      },
    },
  ],
});

export const makePageView = (value: number[], version: number): PageView => ({
  ts: 100,
  features: {
    topicDist: {
      version,
      value,
    },
  },
});
