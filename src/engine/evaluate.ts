import * as reducers from './reducers';
import * as matchers from './matchers';
import { queryMatches } from './filters';
import {
  PageView,
  EngineCondition,
  AudienceDefinitionFilter,
} from '../../types';

/* Checks each pageView once for any matching queries
 * and returns the filtered array containing the matched
 * pageViews
 */
const filterPageViews = (
  filter: EngineCondition<AudienceDefinitionFilter>['filter'],
  pageViews: Readonly<PageView[]>
): PageView[] => {
  return pageViews.filter(
    (pageView) => filter.queries.some((query) => {
      const pageFeatures = pageView.features[query.queryProperty];
      return queryMatches(query, pageFeatures);
    })
  );
};

/* Filter the pageView array by matching queries
 * and evaluates if it matches the conditions
 * based on the condition reducing rules
 */
export const evaluateCondition = (
  condition: Readonly<EngineCondition<AudienceDefinitionFilter>>,
  pageViews: Readonly<PageView[]>
): boolean => {
  const { filter, rules } = condition;

  const filteredPageViews = filterPageViews(filter, pageViews)

  return rules.every((rule) => {
    // TODO: allow other reducers...
    //     // const reducer = reducers[rule.reducer.name](rule.reducer.args);
    const reducer = reducers[rule.reducer.name]();
    const value = reducer(filteredPageViews);
    const matches = matchers[rule.matcher.name](rule.matcher.args);

    return matches(value);
  });
};

export const testables ={
  filterPageViews,
}
