import { vectorDistance } from '../utils';

export const includes = <T>(queryFeatures: T[], queryValue: T[]): boolean =>
  queryFeatures.some((feature) => queryValue.indexOf(feature) !== -1);

export const dotProduct = (
  queryFeatures: number[],
  queryValue: { vector: number[]; threshold: number }
): boolean =>
  queryFeatures.length === queryValue.vector.length
    ? vectorDistance(queryFeatures, queryValue.vector) > queryValue.threshold
    : false;
