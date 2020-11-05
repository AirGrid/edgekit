import { dotProduct, cosineSimilarity as cosSimilarity } from '../utils';

export const arrayIntersects = (
  queryFeatures: string[],
  queryValue: string[]
): boolean =>
  queryFeatures.some((feature) => queryValue.indexOf(feature) !== -1);

export const vectorDistance = (
  queryFeatures: number[],
  queryValue: { vector: number[]; threshold: number }
): boolean =>
  queryFeatures.length === queryValue.vector.length
    ? dotProduct(queryFeatures, queryValue.vector) > queryValue.threshold
    : false;

export const cosineSimilarity = (
  queryFeatures: number[],
  queryValue: { vector: number[]; threshold: number }
): boolean =>
  queryFeatures.length === queryValue.vector.length
    ? cosSimilarity(queryFeatures, queryValue.vector) > queryValue.threshold
    : false;
