import * as reducers from './reducers';
import * as matchers from './matchers';
import { queryMatches } from './filters';
import {
  PageView,
  EngineCondition,
  AudienceDefinitionFilter,
} from '../../types';

/* Filter the pageView array by matching queries
 * and evaluates if it matches the conditions
 * based on the condition reducing rules
 */
export const evaluateCondition = (
  condition: Readonly<EngineCondition<AudienceDefinitionFilter>>,
  pageViews: Readonly<PageView[]>
): boolean => {
  const { filter, rules } = condition;

  // if no queries, do not match at all
  if (pageViews.length === 0 || filter.queries.length === 0) {
    return false;
  }

  /* Checks each pageView once for any matching queries
   * and returns the filtered array containing the matched
   * pageViews
   *
   * TODO Here, also, we have an opportunity to implement the
   * internal AND logic, swapping some for every
   * according to the value of filter.any
   *
   * NOTE: there is actually a semantic problem here.
   * The filter definition specifies an 'any' switch,
   * which defaults to false. However, the current
   * filtering uses `some` to check the query conditions.
   * The complete implementation here would be:
   * ```
   * filter.queries[filter.any ? 'some' : 'every']((query) => ...
   * ```
   * Yet, there is too much (testing) code depending on
   * this defaulting to `some` and the refactor would take
   * some time.
   */
  const filteredPageViews = pageViews.filter((pageView) =>
    filter.queries.some((query) => {
      const pageFeatures = pageView.features[query.queryProperty];
      return queryMatches(query, pageFeatures);
    })
  );

  return rules.every((rule) => {
    const reducer = reducers[rule.reducer.name]();
    const value = reducer(filteredPageViews);
    const matches = matchers[rule.matcher.name](rule.matcher.args);

    return matches(value);
  });
};
