import {
  AudienceDefinitionFilter,
  EngineConditionQuery,
  PageFeatureResult,
} from '../../../types';
import {
  versionMatches,
  cosineSimilarityCondition,
  logisticRegressionCondition,
} from './conditions';

export const queryMatches = (
  query: EngineConditionQuery<AudienceDefinitionFilter>,
  pageFeatures?: PageFeatureResult
): boolean => {
  if (!pageFeatures || !versionMatches(query, pageFeatures)) {
    return false;
  }

  // matches if any of the conditions are satisfied
  return [
    cosineSimilarityCondition,
    logisticRegressionCondition,
  ].some((match) => match(query, pageFeatures));
};
