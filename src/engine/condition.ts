import * as reducers from './reducers';
import * as matchers from './matchers';
import { PageView, EngineCondition, EngineConditionRule } from '../../types';

const createCondition = <T>(condition: EngineCondition) => (
  pageViews: PageView<T>[]
): boolean => {
  const { filter, rules } = condition;
  const filteredPageViews = filter.queries
    .map((query) => {
      return pageViews.filter((pageView) => {
        if (query.property === 'keywords') {
          const queryFeatures = pageView.features[query.property];
          return queryFeatures.some((v) => query.value.indexOf(v) !== -1);
        } else {
          return true;
        }
      });
    })
    .flat();

  const matchNumber = (rule: EngineConditionRule, value: number) => {
    switch (rule.matcher.name) {
      case 'eq':
      case 'gt':
      case 'lt':
      case 'ge':
      case 'le':
        const matcher = matchers[rule.matcher.name](rule.matcher.args);
        return matcher(value);
      default:
        return false;
    }
  };

  const matchNumbers = (rule: EngineConditionRule, value: number[]) => {
    switch (rule.matcher.name) {
      case 'isVectorSimilar':
        const matcher = matchers[rule.matcher.name](rule.matcher.args);
        return matcher(value);
      default:
        return false;
    }
  };

  const ruleResults = rules.map((rule) => {
    switch (rule.reducer.name) {
      case 'count':
        const numReducer = reducers[rule.reducer.name]();
        return matchNumber(rule, numReducer(filteredPageViews));
      case 'dotProducts':
        const numsReducer = reducers[rule.reducer.name](rule.reducer.args);
        return matchNumbers(rule, numsReducer(filteredPageViews));
      default:
        return false;
    }
  });

  return !ruleResults.includes(false);
};

export default createCondition;
