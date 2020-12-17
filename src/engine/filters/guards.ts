import {
  ArrayIntersectsFilter,
  AudienceDefinitionFilter,
  CosineSimilarityFilter,
  EngineConditionQuery,
  VectorDistanceFilter,
  VectorQueryValue,
  QueryFilterComparisonType,
} from '../../../types';

/* Type Guards */

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

export const isArrayIntersectsFilterType = (
  query: EngineConditionQuery<AudienceDefinitionFilter>
): query is EngineConditionQuery<ArrayIntersectsFilter> => {
  return (
    query.queryFilterComparisonType ===
      QueryFilterComparisonType.ARRAY_INTERSECTS &&
    isStringArray(query.queryValue)
  );
};

export const isVectorDistanceFilterType = (
  query: EngineConditionQuery<AudienceDefinitionFilter>
): query is EngineConditionQuery<VectorDistanceFilter> => {
  return (
    query.queryFilterComparisonType ===
      QueryFilterComparisonType.VECTOR_DISTANCE &&
    isVectorQueryValue(query.queryValue)
  );
};

export const isCosineSimilarityFilterType = (
  query: EngineConditionQuery<AudienceDefinitionFilter>
): query is EngineConditionQuery<CosineSimilarityFilter> => {
  return (
    query.queryFilterComparisonType ===
      QueryFilterComparisonType.COSINE_SIMILARITY &&
    isVectorQueryValue(query.queryValue)
  );
};
