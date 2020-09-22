import { AudienceDefinition, EngineCondition } from '../../types';
import { isStringArray, isVectorQueryValue } from '../utils';

export const translate = (
  audienceDefinition: AudienceDefinition
): EngineCondition[] => {
  const condition: EngineCondition = {
    filter: {
      queries:
        audienceDefinition.queryFilterComparisonType === 'includes' &&
        isStringArray(audienceDefinition.queryValue)
          ? [
              {
                property: audienceDefinition.queryProperty,
                filterComparisonType:
                  audienceDefinition.queryFilterComparisonType,
                value: audienceDefinition.queryValue,
              },
            ]
          : audienceDefinition.queryFilterComparisonType === 'vectorDistance' &&
            isVectorQueryValue(audienceDefinition.queryValue)
          ? [
              {
                property: audienceDefinition.queryProperty,
                filterComparisonType:
                  audienceDefinition.queryFilterComparisonType,
                value: audienceDefinition.queryValue,
              },
            ]
          : [],
    },
    rules: [
      {
        reducer: {
          name: 'count',
        },
        matcher: {
          name: 'gt',
          args: audienceDefinition.occurrences,
        },
      },
    ],
  };

  return [condition];
};
