import createCondition from './condition';
import { translate } from './translate';
import { PageView, EngineCondition } from '../../types';

const check = <T>(
  conditions: EngineCondition[],
  pageViews: PageView<T>[],
  any = false
): boolean => {
  const checkedConditions = conditions.map((condition) => {
    return createCondition<T>(condition)(pageViews);
  });

  return any
    ? checkedConditions.includes(true)
    : !checkedConditions.includes(false);
};

export { translate, check };
