import {
  Audience,
  EngineCondition,
  EngineConditionQuery,
  AudienceDefinitionFilter,
} from '../../types';

/*
 * Audience to Engine adapter
 *
 * Maintais the union over the translation layer
 * so the type can discriminated further bellow
 * the computation
 */
export const translate = (
  audienceDefinition: Readonly<Pick<Audience, "definition">>
): EngineCondition<AudienceDefinitionFilter>[] => {

  const {
    featureVersion,
    queryProperty,
    queryFilterComparisonType,
    queryValue,
    occurrences,
  } = audienceDefinition.definition;

  return [{
    filter: {
      queries: [
        {
          featureVersion,
          queryProperty,
          queryFilterComparisonType,
          queryValue,
        } as EngineConditionQuery<AudienceDefinitionFilter>,
      ]
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
  }];
};
