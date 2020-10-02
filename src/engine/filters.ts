import { PageFeatureValue } from '../../types';
import { dotProduct, isNumberArray, isStringArray } from '../utils';

export const arrayIntersects = (
  queryFeatures: PageFeatureValue,
  queryValue: string[]
): boolean =>
  isStringArray(queryFeatures) &&
  queryFeatures.some((feature) => queryValue.indexOf(feature) !== -1);

export const vectorDistance = (
  queryFeatures: PageFeatureValue,
  queryValue: { vector: number[]; threshold: number }
): boolean =>
  isNumberArray(queryFeatures) &&
  queryFeatures.length === queryValue.vector.length
    ? dotProduct(queryFeatures, queryValue.vector) > queryValue.threshold
    : false;
