import { dotProduct, cosineSimilarity } from './math';
import {
  isStringArray,
  isNumberArray,
  isArrayIntersectsFilterType,
  isVectorDistanceFilterType,
  isCosineSimilarityFilterType,
} from './guards';
import {
  AudienceDefinitionFilter,
  CosineSimilarityFilter,
  EngineConditionQuery,
  PageFeatureResult,
  VectorDistanceFilter,
  VectorQueryValue,
} from '../../../types';

/* =======================================
 * matching conditions
 * =======================================
 */

export const versionMatches = (
  features: PageFeatureResult,
  query: EngineConditionQuery<AudienceDefinitionFilter>
): boolean => features.version === query.featureVersion;

const stringArrayIntersects = (
  queryFeatures: string[],
  queryValue: string[]
): boolean =>
  queryFeatures.some((feature) => queryValue.indexOf(feature) !== -1);

const isVectorDistanceGreatherThanThreshold = (
  queryFeatures: number[],
  queryValue: { vector: number[]; threshold: number }
): boolean =>
  queryFeatures.length === queryValue.vector.length
    ? dotProduct(queryFeatures, queryValue.vector) > queryValue.threshold
    : false;

const isCosineSimilarityGreatherThanThreshold = (
  queryFeatures: number[],
  queryValue: { vector: number[]; threshold: number }
): boolean =>
  queryFeatures.length === queryValue.vector.length
    ? cosineSimilarity(queryFeatures, queryValue.vector) > queryValue.threshold
    : false;

const numberVectorArrayFilterMatches = (
  filter: (arg0: number[], arg1: VectorQueryValue) => boolean,
  features: PageFeatureResult,
  query: EngineConditionQuery<VectorDistanceFilter | CosineSimilarityFilter>
): boolean =>
  query.queryValue.some(
    (value) => isNumberArray(features.value) && filter(features.value, value)
  );

/* =======================================
 * string array conditions
 * =======================================
 */

export const arrayIntersectsCondition = (
  features: PageFeatureResult,
  query: EngineConditionQuery<AudienceDefinitionFilter>
): boolean =>
  isArrayIntersectsFilterType(query) &&
  isStringArray(features.value) &&
  stringArrayIntersects(features.value, query.queryValue);

/* =======================================
 * vector array conditions
 * =======================================
 */

export const vectorDistanceCondition = (
  features: PageFeatureResult,
  query: EngineConditionQuery<AudienceDefinitionFilter>
): boolean =>
  isVectorDistanceFilterType(query) &&
  numberVectorArrayFilterMatches(
    isVectorDistanceGreatherThanThreshold,
    features,
    query
  );

export const cosineSimilarityCondition = (
  features: PageFeatureResult,
  query: EngineConditionQuery<AudienceDefinitionFilter>
): boolean =>
  isCosineSimilarityFilterType(query) &&
  numberVectorArrayFilterMatches(
    isCosineSimilarityGreatherThanThreshold,
    features,
    query
  );
