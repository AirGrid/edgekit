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
              value: audienceDefinition.keywords,
            },
          ]
        : audienceDefinition.topicModel
        ? [
            {
              property: 'topicDist',
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
