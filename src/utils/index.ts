import {
  VectorQueryValue,
  EngineConditionQuery,
  QueryFilterComparisonType,
  ArrayIntersectsFilter,
  VectorDistanceFilter,
  CosineSimilarityFilter,
  AudienceDefinitionFilter,
} from '../../types';

export const timeStampInSecs = (): number => Math.round(Date.now() / 1000);

export const timeout = (milliseconds: number, message: string): Promise<void> =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), milliseconds);
  });

const get = (key: string): any => {
  const value = localStorage.getItem(key);
  if (!value) return undefined;

  try {
    return JSON.parse(value);
  } catch (e) {
    return undefined;
  }
};

const set = (key: string, value: any): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (e) {
    // ignore...
  }
};

export const storage = {
  set,
  get,
};

export const dotProduct = (vectorA: number[], vectorB: number[]): number => {
  return vectorA.reduce((acc, cur, idx) => acc + cur * vectorB[idx], 0);
};

export const euclideanLength = (vector: number[]): number => {
  return Math.sqrt(vector.reduce((acc, cur) => acc + Math.pow(cur, 2), 0));
};

export const cosineSimilarity = (
  vectorA: number[],
  vectorB: number[]
): number => {
  return (
    dotProduct(vectorA, vectorB) /
    (euclideanLength(vectorA) * euclideanLength(vectorB))
  );
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const isStringArray = (value: any): value is string[] =>
  value instanceof Array && value.every((item) => typeof item === 'string');

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const isNumberArray = (value: any): value is number[] =>
  value instanceof Array && value.every((item) => typeof item === 'number');

export const isVectorQueryValue = (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  value: any
): value is VectorQueryValue =>
  isNumberArray(value.vector) && typeof value.threshold === 'number';

export const isArrayIntersectsFilter = (
  query: EngineConditionQuery<AudienceDefinitionFilter>
): query is EngineConditionQuery<ArrayIntersectsFilter> => {
  return query.queryFilterComparisonType === QueryFilterComparisonType.ARRAY_INTERSECTS // && isStringArray(query.value)
}

export const isVectorDistanceFilter = (
  query: EngineConditionQuery<AudienceDefinitionFilter>
): query is EngineConditionQuery<VectorDistanceFilter> => {
  return query.queryFilterComparisonType === QueryFilterComparisonType.VECTOR_DISTANCE // && query.value.every(arr => isNumberArray(arr))
}

export const isCosineSimilarityFilter = (
  query: EngineConditionQuery<AudienceDefinitionFilter>
): query is EngineConditionQuery<CosineSimilarityFilter> => {
  return query.queryFilterComparisonType === QueryFilterComparisonType.COSINE_SIMILARITY // && query.value.every(arr => isNumberArray(arr))
}
