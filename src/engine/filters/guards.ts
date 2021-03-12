import {
  AudienceDefinitionFilter,
  CosineSimilarityFilter,
  LogisticRegressionFilter,
  EngineConditionQuery,
  CosineSimilarityQueryValue,
  LogisticRegressionQueryValue,
  QueryFilterComparisonType,
} from '../../../types';

/* Type Guards */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const isNumberArray = (value: any): value is number[] =>
  value instanceof Array && value.every((item) => typeof item === 'number');

export const isCosineSimilarityQueryValue = (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  value: any
): value is CosineSimilarityQueryValue =>
  isNumberArray(value.vector) && typeof value.threshold === 'number';

export const isLogRegQueryValue = (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  value: any
): value is LogisticRegressionQueryValue =>
  isNumberArray(value.vector) &&
  typeof value.threshold === 'number' &&
  typeof value.bias === 'number';

export const isCosineSimilarityFilterType = (
  query: EngineConditionQuery<AudienceDefinitionFilter>
): query is EngineConditionQuery<CosineSimilarityFilter> => {
  return (
    query.queryFilterComparisonType ===
      QueryFilterComparisonType.COSINE_SIMILARITY &&
    isCosineSimilarityQueryValue(query.queryValue)
  );
};

export const isLogisticRegressionFilterType = (
  query: EngineConditionQuery<AudienceDefinitionFilter>
): query is EngineConditionQuery<LogisticRegressionFilter> => {
  return (
    query.queryFilterComparisonType ===
      QueryFilterComparisonType.LOGISTIC_REGRESSION &&
    isLogRegQueryValue(query.queryValue)
  );
};
