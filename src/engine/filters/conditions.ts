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
  EngineConditionQuery,
  PageFeatureResult,
} from 'types';

/* =======================================
 * matching conditions
 * =======================================
 */

export const versionMatches = (
  query: EngineConditionQuery<AudienceDefinitionFilter>,
  pageFeatures: PageFeatureResult
): boolean => pageFeatures.version === query.featureVersion;

const stringArrayIntersects = (
  queryValue: string[],
  pageFeatures: string[]
): boolean =>
  pageFeatures.some((feature) => queryValue.indexOf(feature) !== -1);

const isVectorDistanceGreatherThanThreshold = (
  queryValue: { vector: number[]; threshold: number },
  pageFeatures: number[]
): boolean =>
  pageFeatures.length === queryValue.vector.length
    ? dotProduct(pageFeatures, queryValue.vector) > queryValue.threshold
    : false;

const isCosineSimilarityGreatherThanThreshold = (
  queryValue: { vector: number[]; threshold: number },
  pageFeatures: number[]
): boolean =>
  pageFeatures.length === queryValue.vector.length
    ? cosineSimilarity(pageFeatures, queryValue.vector) > queryValue.threshold
    : false;

/* =======================================
 * string array conditions
 * =======================================
 */

export const arrayIntersectsCondition = (
  query: EngineConditionQuery<AudienceDefinitionFilter>,
  pageFeatures: PageFeatureResult
): boolean =>
  isArrayIntersectsFilterType(query) &&
  isStringArray(pageFeatures.value) &&
  stringArrayIntersects(query.queryValue, pageFeatures.value);

/* =======================================
 * vector array conditions
 * =======================================
 */

export const vectorDistanceCondition = (
  query: EngineConditionQuery<AudienceDefinitionFilter>,
  pageFeatures: PageFeatureResult
): boolean =>
  isVectorDistanceFilterType(query) &&
  isNumberArray(pageFeatures.value) &&
  isVectorDistanceGreatherThanThreshold(query.queryValue, pageFeatures.value);

export const cosineSimilarityCondition = (
  query: EngineConditionQuery<AudienceDefinitionFilter>,
  pageFeatures: PageFeatureResult
): boolean =>
  isCosineSimilarityFilterType(query) &&
  isNumberArray(pageFeatures.value) &&
  isCosineSimilarityGreatherThanThreshold(query.queryValue, pageFeatures.value);
