import { AudienceDefinition, EngineCondition } from '../../types';

export const translate = (
  audienceDefinition: AudienceDefinition
): EngineCondition[] => {
  const condition: EngineCondition = {
    filter: {
      queries: [
        {
          property: 'keywords',
          value: audienceDefinition.keywords,
        },
      ],
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
