import { AudienceDefinition, EngineCondition } from '../../types';

export const translate = (
  audienceDefinition: AudienceDefinition
): EngineCondition[] => {
  const condition: EngineCondition = {
    filter: {
      queries: audienceDefinition.keywords
        ? [
            {
              property: 'keywords',
              filterType: 'includes',
              value: audienceDefinition.keywords,
            },
          ]
        : audienceDefinition.topicModel
        ? [
            {
              property: 'topicDist',
              filterType: 'dotProduct',
              value: audienceDefinition.topicModel,
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
