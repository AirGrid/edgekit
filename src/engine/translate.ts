import { AudienceDefinition, EngineCondition } from '../../types';

export const translate = (
  audienceDefinition: AudienceDefinition
): EngineCondition[] => {
  const condition: EngineCondition = {
    filter: {
      queries: [
        {
          property: audienceDefinition.queryProperty,
          filterComparisonType: audienceDefinition.queryFilterComparisonType,
          // TODO: avoid coercing the type
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value: (audienceDefinition as any)[audienceDefinition.queryProperty],
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
