import createCondition from './condition';
import { IPageView, ICondition } from './types';

export const check = (
  conditions: ICondition[],
  pageViews: IPageView[],
  any = false
): boolean => {
  const checkedConditions = conditions.map((condition) => {
    return createCondition(condition)(pageViews);
  });

  return any
    ? checkedConditions.includes(true)
    : !checkedConditions.includes(false);
};
