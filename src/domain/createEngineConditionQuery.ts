import { EngineConditionQuery, StringArrayComparasionTypes, TDefinition, VectorQueryComparasionTypes } from '../../types';
import { isStringArray, isVectorQueryValue } from '../utils';

export interface EngineConditionQueryResponse {
  error: boolean
  data: EngineConditionQuery[] | []
}
/**
 * @param  {TDefinition} definition
 * @returns EngineConditionQueryResponse
 * @description Checks if queryValue is valid based on comparasionTypes related validations
 * and returns data: EngineConditionQuery[] with error: false if validation succeded
 * error: true and data: [] if validation fails
 */
const createEngineConditionQueries = (definition: TDefinition): EngineConditionQueryResponse => {
  const {
    featureVersion, queryProperty, queryValue, queryFilterComparisonType
  } = definition;
  let isValid = true;

  switch (queryFilterComparisonType) {
    case StringArrayComparasionTypes.arrayIntersects:
      isValid = isStringArray(queryValue)
      break;
    case VectorQueryComparasionTypes.vectorDistance:
      isValid = isVectorQueryValue(queryValue)
      break;
    case VectorQueryComparasionTypes.cosineSimilarity:
      isValid = isVectorQueryValue(queryValue)
      break;
    default:
      isValid = false;
  }

  if (!isValid) return { error: true, data: [] }

  return {
    error: false,
    data: [
      {
        version: featureVersion,
        property: queryProperty,
        value: queryValue,
        filterComparisonType: queryFilterComparisonType
      }
    ]
  }
}

export default createEngineConditionQueries;