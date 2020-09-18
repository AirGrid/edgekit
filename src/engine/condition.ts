import * as reducers from './reducers';
import * as matchers from './matchers';
import { PageView, EngineCondition } from '../../types';
import { dotProduct } from '../utils';

const createCondition = <T>(condition: EngineCondition) => (
  pageViews: PageView<T>[]
): boolean => {
  const { filter, rules } = condition;
  const filteredPageViews = filter.queries
    .map((query) => {
      return pageViews.filter((pageView) => {
        if (query.property === 'keywords') {
          const queryFeatures = pageView.features[query.property];
          return (queryFeatures || []).some(
            (v) => query.value.indexOf(v) !== -1
          );
        } else if (query.property === 'topicDist') {
          const queryFeatures = pageView.features[query.property];
          return queryFeatures &&
            queryFeatures.length === query.value.vector.length
            ? dotProduct(queryFeatures, query.value.vector) >
                query.value.threshold
            : false;
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
