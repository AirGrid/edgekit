import {
  AudienceDefinition,
  EngineCondition,
  EngineConditionQuery,
  QueryFilterComparison, QueryFilterComparisonType,
} from '../../types';
import { isStringArray, isVectorQueryValue } from '../utils';

export const translate = (
    audienceDefinition: AudienceDefinition
): EngineCondition[] => {
  const createEngineConditions = (): EngineConditionQuery[] => ([
    {
      version: audienceDefinition.definition.featureVersion,
      property: audienceDefinition.definition.queryProperty,
      filterComparisonType: audienceDefinition.definition.queryFilterComparisonType as QueryFilterComparisonType,
      // TODO: change any to generic
      value: audienceDefinition.definition.queryValue as any,
    }
  ]);

  const createEngineConditionQueries = () => (QueryFilterComparison[audienceDefinition.definition.queryFilterComparisonType] &&
  (isStringArray(audienceDefinition.definition.queryValue) || isVectorQueryValue(audienceDefinition.definition.queryValue))
      ? createEngineConditions()
      : []);

  const condition: EngineCondition = {
    filter: {
      queries: createEngineConditionQueries()
    },
    rules: [
      {
        reducer: {
          name: 'count',
        },
        matcher: {
          name: 'gt',
          args: audienceDefinition.definition.occurrences,
        },
      },
    ],
  };

  return [condition];
};
