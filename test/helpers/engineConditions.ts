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

export const makePageView = (
  value: number[],
  version: number,
  ts = 100,
  queryProperty = 'docVector'
): PageView => ({
  ts,
  features: {
    [queryProperty]: {
      version,
      value,
    },
  },
});
