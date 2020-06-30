import { PageView, Condition } from 'types';
import createCondition from './condition';

export const check = (
  conditions: Condition[],
  pageViews: PageView[],
  any = false
): boolean => {
  const checkedConditions = conditions.map((condition) => {
    return createCondition(condition)(pageViews);
  });

  return any
    ? checkedConditions.includes(true)
    : !checkedConditions.includes(false);
};
