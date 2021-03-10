import {
  AudienceDefinition,
  EngineCondition,
  AudienceDefinitionFilter,
} from '../../types';

/*
 * Audience to Engine translation
 *
 * Maintains union type over the translation layer
 * so it can be discriminated further below the computation
 */
export const translate = (
  audienceDefinition: AudienceDefinition
): EngineCondition<AudienceDefinitionFilter> => {
  return {
    filter: {
      any: false,
      queries: audienceDefinition.definition,
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
};
