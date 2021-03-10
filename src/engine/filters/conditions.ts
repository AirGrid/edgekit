import { dotProduct, cosineSimilarity, sigmoid } from './math';
import {
  isNumberArray,
  isCosineSimilarityFilterType,
  isLogisticRegressionFilterType,
} from './guards';
import {
  AudienceDefinitionFilter,
  EngineConditionQuery,
  PageFeatureResult,
  CosineSimilarityQueryValue,
  LogisticRegressionQueryValue,
} from '../../../types';

export const versionMatches = (
  query: EngineConditionQuery<AudienceDefinitionFilter>,
  pageFeatures: PageFeatureResult
): boolean => pageFeatures.version === query.featureVersion;

const isCosineSimilarityGreatherThanThreshold = (
  queryValue: CosineSimilarityQueryValue,
  pageFeatures: number[]
): boolean =>
  pageFeatures.length === queryValue.vector.length
    ? cosineSimilarity(pageFeatures, queryValue.vector) > queryValue.threshold
    : false;

const isLogisticRegressionGreatherThanThreshold = (
  queryValue: LogisticRegressionQueryValue,
  pageFeatures: number[]
): boolean =>
  pageFeatures.length === queryValue.vector.length
    ? sigmoid(dotProduct(queryValue.vector, pageFeatures) + queryValue.bias) >
      queryValue.threshold
    : false;

export const cosineSimilarityCondition = (
  query: EngineConditionQuery<AudienceDefinitionFilter>,
  pageFeatures: PageFeatureResult
): boolean =>
  isCosineSimilarityFilterType(query) &&
  isNumberArray(pageFeatures.value) &&
  isCosineSimilarityGreatherThanThreshold(query.queryValue, pageFeatures.value);

export const logisticRegressionCondition = (
  query: EngineConditionQuery<AudienceDefinitionFilter>,
  pageFeatures: PageFeatureResult
): boolean =>
  isLogisticRegressionFilterType(query) &&
  isNumberArray(pageFeatures.value) &&
  isLogisticRegressionGreatherThanThreshold(
    query.queryValue,
    pageFeatures.value
  );
