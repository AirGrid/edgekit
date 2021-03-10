import {
  EngineCondition,
  EngineConditionQuery,
  PageView,
  AudienceQueryDefinition,
  EngineConditionRule,
} from '../../types';

export const makeEngineCondition = <T extends AudienceQueryDefinition>(
  queries: EngineConditionQuery<T>[],
  occurences: EngineConditionRule['matcher']['args'] = 1,
  condition: EngineConditionRule['matcher']['name'] = 'ge'
): EngineCondition<T> => ({
  filter: {
    any: false,
    queries,
  },
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: condition,
        args: occurences,
      },
    },
  ],
});

export const makeTopicDistPageView = (
  value: number[],
  version: number,
  ts = 100
): PageView => ({
  ts,
  features: {
    topicDist: {
      version,
      value,
    },
  },
});

export const makeDocVectorPageView = (
  value: number[],
  version: number,
  ts = 100
): PageView => ({
  ts,
  features: {
    docVector: {
      version,
      value,
    },
  },
});
