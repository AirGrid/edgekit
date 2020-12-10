import {
  AudienceDefinition,
  EngineCondition,
  EngineConditionQuery,
  AudienceDefinitionFilter,
} from '../../types';

/*
 * I'm maintaining the union over the translation layer
 * so the compiler can discriminate it further bellow in the computation
 * TODO Better audienceDefinition validation
 */
export const translate = (
  audienceDefinition: Readonly<Pick<AudienceDefinition, "definition">>
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
