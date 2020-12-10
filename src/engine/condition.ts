import * as reducers from './reducers';
import * as matchers from './matchers';
import * as filters from './filters';
import {
  PageView,
  PageFeatureResult,
  EngineCondition,
  EngineConditionQuery,
  ArrayIntersectsFilter,
  VectorDistanceFilter,
  CosineSimilarityFilter,
  AudienceDefinitionFilter,
  VectorQueryValue,
} from '../../types';
import {
  isNumberArray,
  isStringArray,
  isArrayIntersectsFilter,
  isVectorDistanceFilter,
  isCosineSimilarityFilter,
} from '../utils';

const createCondition = (condition: EngineCondition<AudienceDefinitionFilter>) =>
  (pageViews: PageView[]): boolean => {
  const { filter, rules } = condition;
  const filteredPageViews = filter.queries
  .map((query) => {
    return pageViews.filter((pageView) => {
      const queryFeatures: PageFeatureResult = pageView.features[query.queryProperty];
      return isArrayIntersectsFilter(query)
        ? isArrayIntersects(queryFeatures, query)
        : isVectorDistanceFilter(query)
        ? isVectorDistanceLesserThanThreshold(queryFeatures, query)
        : isCosineSimilarityFilter(query)
        ? isCosineSimilarityLesserThanThreshold(queryFeatures, query)
        : true;  /* TODO is this right?
                  * Values should only be comparable if
                  * they share the same type, so I would
                  * use a type guard besides the filter guards
                  * to check if value types matches.
                  * However, if they don't, we end up here,
                  * where we return true as in a matching
                  * situation.
                  * Not what I would naively expect.
                  */
    });
  })
  .flat();

  const ruleResults = rules.map((rule) => {
    // TODO: allow other reducers...
    //     // const reducer = reducers[rule.reducer.name](rule.reducer.args);
    const reducer = reducers[rule.reducer.name]();
    const value = reducer(filteredPageViews);
    const matcher = matchers[rule.matcher.name](rule.matcher.args);
    const result = matcher(value);

    return result;
  });

  return !ruleResults.includes(false);
};

export default createCondition;

/* Matching conditions pieces */

const isArrayIntersects =
  (features: PageFeatureResult, query: EngineConditionQuery<ArrayIntersectsFilter>): boolean =>
  !!features &&
  versionMatches(features, query) &&
  stringArrayFilterMatches(filters.arrayIntersects, features, query);

const isVectorDistanceLesserThanThreshold =
  (features: PageFeatureResult, query: EngineConditionQuery<VectorDistanceFilter>): boolean =>
  !!features &&
  versionMatches(features, query) &&
  numberVectorArrayFilterMatches(filters.vectorDistance, features, query);

const isCosineSimilarityLesserThanThreshold =
  (features: PageFeatureResult, query: EngineConditionQuery<CosineSimilarityFilter>): boolean =>
  !!features &&
  versionMatches(features, query) &&
  numberVectorArrayFilterMatches(filters.cosineSimilarity, features, query);

/* Matching conditions pieces */

const versionMatches = (
  features: PageFeatureResult,
  query: EngineConditionQuery<AudienceDefinitionFilter>
): boolean => features.version === query.featureVersion

/* In the current implementation
 * this should actually take a filter of type
 * (arg0: PageFeatureValue, arg1: string[]) => boolean
 * so to match the possibility of features
 * of a mismatching type returning a truthy
 * value.
 * Relates to the above comment on createCondition.
 * */
const stringArrayFilterMatches = (
  filter: (arg0: string[], arg1: string[]) => boolean,
  features: PageFeatureResult,
  query: EngineConditionQuery<ArrayIntersectsFilter>
): boolean =>
  isStringArray(features.value) &&
  filter(features.value, query.queryValue);

/* In the current implementation
 * this should actually take a filter of type
 * (arg0: PageFeatureValue, arg1: VectorQueryValue) => boolean
 * so to match the possibility of features
 * of a mismatching type returning a truthy
 * value.
 * Relates to the above comment on createCondition.
 * */
const numberVectorArrayFilterMatches = (
  filter: (arg0: number[], arg1: VectorQueryValue) => boolean,
  features: PageFeatureResult,
  query: EngineConditionQuery<VectorDistanceFilter | CosineSimilarityFilter>
): boolean =>
  query.queryValue.some(value =>
                   isNumberArray(features.value) &&
                   filter(features.value, value));
