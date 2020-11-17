import { EngineConditionQuery, PageView, StringArrayComparasionTypes, VectorQueryComparasionTypes } from "../../types";
import * as filters from '../engine/filters';

/**
 * @param  {EngineConditionQuery} query
 * @param  {PageView} pageView
 * @returns boolean
 * @description Filters based on queryFilterComparisonType and queryFeaturesValue
 * Will run the query filter function present in queryFilterComparisonType on the fetched features 
 * with the values provided by queryValue.
 * For exampe: The filters['arrayIntersects'] function checks if there is a set intersection. 
 * The two sets do intersect in this case (['football']) so there is a match.
 */
export const pageViewFilter = (
  query: EngineConditionQuery,
  pageView: PageView
) => {
  const queryFeatures = pageView.features[query.property];
  const matchesVersion = queryFeatures.version === query.version;
  const functionToCall = query.filterComparisonType;

  if (!queryFeatures || !matchesVersion) return false;

  let availableComparisonTypes = [
    ...Object.values(VectorQueryComparasionTypes),
    ...Object.values(StringArrayComparasionTypes)
  ];

  if (availableComparisonTypes.includes(functionToCall)) {
    return (filters as Record<string, any>)[query.filterComparisonType](queryFeatures.value as any, query.value as any, true)
  };

  return true
}
