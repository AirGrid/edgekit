import { PageView, EngineCondition } from 'types';
import createCondition from './condition';
import { translate } from './translate';

const check = (
  conditions: EngineCondition[],
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

export { translate, check };
