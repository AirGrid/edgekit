import { AudienceDefinition, EngineCondition } from '../../types';
import {
  isKeywordsAudienceDefinition,
  isTopicModelAudienceDefinition,
} from '../utils';

export const translate = (
  audienceDefinition: AudienceDefinition
): EngineCondition[] => {
  const condition: EngineCondition = {
    filter: {
      queries: isKeywordsAudienceDefinition(audienceDefinition)
        ? [
            {
              property: 'keywords',
              filterType: 'includes',
              value: audienceDefinition.keywords,
            },
          ]
        : isTopicModelAudienceDefinition(audienceDefinition)
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
