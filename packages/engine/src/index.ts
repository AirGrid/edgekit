import createCondition from './condition';
import { IPageView, ICondition } from './types';

export const check = (
  conditions: ICondition[],
  pageViews: IPageView[]
  // any: boolean = false
) => {
  const checkedConditions = conditions.map(condition => {
    return createCondition(condition)(pageViews);
  });
  console.log(checkedConditions);
  return checkedConditions;
};
