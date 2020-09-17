import {
  AudienceDefinition,
  EngineCondition,
  VectorCondition,
} from '../../types';

export const translate = (
  audienceDefinition: AudienceDefinition
): EngineCondition[] => {
  const topicModelRule:
    | [
        {
          reducer: {
            name: 'dotProducts';
            args: number[];
          };
          matcher: {
            name: 'isVectorSimilar';
            args: VectorCondition;
          };
        }
      ]
    | [] = audienceDefinition.topicModel
    ? [
        {
          reducer: {
            name: 'dotProducts',
            args: audienceDefinition.topicModel.vector,
          },
          matcher: {
            name: 'isVectorSimilar',
            args: audienceDefinition.topicModel.condition,
          },
        },
      ]
    : [];

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
      ...topicModelRule,
    ],
  };

  return [condition];
};
