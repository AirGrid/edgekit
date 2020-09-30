import * as reducers from './reducers';
import * as matchers from './matchers';
import * as filters from './filters';
import { PageView, EngineCondition } from '../../types';
import { isNumberArray, isStringArray } from '../utils';

const createCondition = (condition: EngineCondition) => (
  pageViews: PageView[]
): boolean => {
  const { filter, rules } = condition;
  const filteredPageViews = filter.queries
    .map((query) => {
      return pageViews.filter((pageView) => {
        const queryFeatures = pageView.features[query.property];

        if (query.filterComparisonType === 'arrayIntersects') {
          return (
            !!queryFeatures &&
            queryFeatures.version === query.version &&
            isStringArray(queryFeatures.value) &&
            filters.arrayIntersects(queryFeatures.value, query.value)
          );
        } else if (query.filterComparisonType === 'vectorDistance') {
          return (
            !!queryFeatures &&
            queryFeatures.version === query.version &&
            isNumberArray(queryFeatures.value) &&
            filters.vectorDistance(queryFeatures.value, query.value)
          );
        } else {
          return true;
        }
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
