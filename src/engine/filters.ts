import { dotProduct } from '../utils';

export const includes = <T>(queryFeatures: T[], queryValue: T[]): boolean =>
  queryFeatures.some((feature) => queryValue.indexOf(feature) !== -1);

export const vectorDistance = (
  queryFeatures: number[],
  queryValue: { vector: number[]; threshold: number }
): boolean =>
  queryFeatures.length === queryValue.vector.length
    ? dotProduct(queryFeatures, queryValue.vector) > queryValue.threshold
    : false;
