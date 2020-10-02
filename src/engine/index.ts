import createCondition from './condition';
import { translate } from './translate';
import { PageView, EngineCondition } from '../../types';

const check = (
  conditions: EngineCondition[],
  pageViews: PageView[],
  any = false
): boolean => {
  const checkedConditions = conditions.map((condition) =>
    createCondition(condition)(pageViews)
  );

  return any
    ? checkedConditions.includes(true)
    : !checkedConditions.includes(false);
};

export { translate, check };
