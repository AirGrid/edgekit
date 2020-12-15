import {
  AudienceDefinition,
  EngineCondition,
  EngineConditionQuery,
  AudienceDefinitionFilter,
} from '../../types';

/*
 * Audience to Engine translation
 *
 * Maintains union type over the translation layer
 * so it can be discriminated further below the computation
 */
export const translate = (
  audienceDefinition: Readonly<Pick<AudienceDefinition, 'definition'>>
): EngineCondition<AudienceDefinitionFilter>[] => {
  const {
    featureVersion,
    queryProperty,
    queryFilterComparisonType,
    queryValue,
    occurrences,
  } = audienceDefinition.definition;

  return [
    {
      filter: {
        queries: [
          {
            featureVersion,
            queryProperty,
            queryFilterComparisonType,
            queryValue,
          } as EngineConditionQuery<AudienceDefinitionFilter>,
        ],
      },
      rules: [
        {
          reducer: {
            name: 'count',
          },
          matcher: {
            name: 'gt',
            args: occurrences,
          },
        },
      ],
    },
  ];
};
