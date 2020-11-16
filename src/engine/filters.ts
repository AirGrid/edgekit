import { dotProduct, cosineSimilarity as cosSimilarity, isStringArray, isNumberArray } from '../utils';

export const arrayIntersects = (
  queryFeatures: string[],
  queryValue: string[],
  checkIsStringArray = false
): boolean => {
  if (checkIsStringArray && !isStringArray(queryValue)) return false;

  return queryFeatures.some((feature) => queryValue.indexOf(feature) !== -1);
}

export const vectorDistance = (
  queryFeatures: number[],
  queryValue: { vector: number[]; threshold: number },
  checkIsNumberArray = false
): boolean => {
  if (checkIsNumberArray && !isNumberArray(queryValue)) return false;
  if (queryFeatures.length !== queryValue.vector.length) return false;

  return dotProduct(queryFeatures, queryValue.vector) > queryValue.threshold;
}
  
export const cosineSimilarity = (
  queryFeatures: number[],
  queryValue: { vector: number[]; threshold: number },
  checkIsNumberArray = false
): boolean => {
  if (checkIsNumberArray && !isNumberArray(queryValue)) return false;
  if (queryFeatures.length !== queryValue.vector.length) return false;

  return cosSimilarity(queryFeatures, queryValue.vector) > queryValue.threshold
};
