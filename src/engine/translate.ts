import { AudienceDefinition, EngineCondition } from '../../types';
import createEngineConditionQueries from '../domain/createEngineConditionQuery'

export const translate = (
  audienceDefinition: AudienceDefinition
): EngineCondition[] => {
  const { definition } = audienceDefinition;

  const query = 
    createEngineConditionQueries(definition)

  const condition: EngineCondition = {
    filter: {
      queries: query.data
    },
    rules: [
      {
        reducer: {
          name: 'count',
        },
        matcher: {
          name: 'gt',
          args: definition.occurrences,
        },
      },
    ],
  };

  return [condition];
};
