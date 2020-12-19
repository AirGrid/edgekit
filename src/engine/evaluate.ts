import * as reducers from './reducers';
import * as matchers from './matchers';
import { queryMatches } from './filters';
import {
  PageView,
  EngineCondition,
  AudienceDefinitionFilter,
} from '../../types';

// Validate whether a set of pageViews passes a set of rules
export const evaluateCondition = (
  condition: EngineCondition<AudienceDefinitionFilter>,
  pageViews: PageView[]
): boolean => {
  const { filter, rules } = condition;

  // We could possibly construct a list of various results for given
  // queries. For instance, if (this query is one we've encountered for
  // this pageViews set) { return the prior result set without doing any iteration }.
  // filteredPageViews = hasQuery(resultsSet) ? return resultsSet[id] :
  // filter.queries...
  const filteredPageViews = filter.queries.flatMap((query) =>
    pageViews.filter((pageView) => {
      const pageFeatures = pageView.features[query.queryProperty];
      return queryMatches(query, pageFeatures);
    })
  );

  // Instead of iterating through everything, assume everything matches
  // first, and exit the loop early if we find anything that doesn't.
  // Further: Can the rules array be sorted in some way? If so, we can
  // possibly use a binary search for O(log n) performance.
  for (const rule of rules) {
    const reducer = reducers[rule.reducer.name]();
    const value = reducer(filteredPageViews);
    const matches = matchers[rule.matcher.name](rule.matcher.args);

    if (!matches(value)) {
      return false;
    }
  }

  // We've iterated over everything, and all is well.
  return true;
};
