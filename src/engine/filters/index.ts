import {
  AudienceDefinitionFilter,
  EngineConditionQuery,
  PageFeatureResult,
} from '../../../types';
import {
  versionMatches,
  arrayIntersectsCondition,
  vectorDistanceCondition,
  cosineSimilarityCondition,
} from './conditions';

export const matchesQuery = (
  query: EngineConditionQuery<AudienceDefinitionFilter>,
  queryFeatures: PageFeatureResult
): boolean => {
  // Can queryFeatures be empty?
  if (!queryFeatures || !versionMatches(queryFeatures, query)) {
    return false;
  }

  // matches if any of the conditions are satisfied
  return [
    arrayIntersectsCondition,
    vectorDistanceCondition,
    cosineSimilarityCondition,
  ].some((match) => match(queryFeatures, query));
};
