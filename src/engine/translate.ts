import { AudienceDefinition, EngineCondition } from '../../types';
import { isStringArray, isVectorQueryValue } from '../utils';

export const translate = (
  audienceDefinition: AudienceDefinition
): EngineCondition[] => {
  const condition: EngineCondition = {
    filter: {
      queries:
        audienceDefinition.definition.queryFilterComparisonType ===
          'arrayIntersects' &&
        isStringArray(audienceDefinition.definition.queryValue)
          ? [
              {
                version: audienceDefinition.version,
                property: audienceDefinition.definition.queryProperty,
                filterComparisonType:
                  audienceDefinition.definition.queryFilterComparisonType,
                value: audienceDefinition.definition.queryValue,
              },
            ]
          : audienceDefinition.definition.queryFilterComparisonType ===
              'vectorDistance' &&
            isVectorQueryValue(audienceDefinition.definition.queryValue)
          ? [
              {
                version: audienceDefinition.version,
                property: audienceDefinition.definition.queryProperty,
                filterComparisonType:
                  audienceDefinition.definition.queryFilterComparisonType,
                value: audienceDefinition.definition.queryValue,
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
          args: audienceDefinition.definition.occurrences,
        },
      },
    ],
  };

  return [condition];
};
