import * as reducers from './reducers';
import * as matchers from './matchers';
import * as filters from './filters';
import { PageView, EngineCondition } from '../../types';

const createCondition = (condition: EngineCondition) => (
  pageViews: PageView[]
): boolean => {
  const { filter, rules } = condition;
  const filteredPageViews = filter.queries
    .map((query) => {
      return pageViews.filter((pageView) => {
        const queryFeatures = pageView.features[query.property];
        const isValidQuery =
          !!queryFeatures && queryFeatures.version === query.version;

        // TODO: maybe switch from string literal type to actual function
        // so that we can just go ```query.filter(...)```
        if (query.filterComparisonType === 'arrayIntersects') {
          return (
            isValidQuery &&
            filters.arrayIntersects(queryFeatures.value, query.value)
          );
        } else if (query.filterComparisonType === 'vectorDistance') {
          return (
            isValidQuery &&
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

  return ruleResults.every(Boolean);
};

export default createCondition;
