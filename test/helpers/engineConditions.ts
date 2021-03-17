import {
  EngineCondition,
  EngineConditionQuery,
  PageView,
  AudienceQueryDefinition,
  EngineConditionRule,
} from '../../types';

type MakeEngineConditionInput<T extends AudienceQueryDefinition> = {
  queries: EngineConditionQuery<T>[];
  occurences?: EngineConditionRule['matcher']['args'];
  condition?: EngineConditionRule['matcher']['name'];
};

export const makeEngineCondition = <T extends AudienceQueryDefinition>({
  queries,
  occurences,
  condition,
}: MakeEngineConditionInput<T>): EngineCondition<T> => ({
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
        name: condition || 'ge',
        args: occurences || 1,
      },
    },
  ],
});

type MakePageViewInput = {
  value: number[];
  version: number;
  ts?: number;
  queryProperty?: string;
};

export const makePageView = ({
  value,
  version,
  ts,
  queryProperty,
}: MakePageViewInput): PageView => ({
  ts: ts || 100,
  features: {
    [queryProperty || 'docVector']: {
      version,
      value,
    },
  },
});
