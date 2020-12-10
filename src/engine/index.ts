import createCondition from './condition';
import { translate } from './translate';
import { PageView, EngineCondition, AudienceDefinitionFilter } from '../../types';

const check = (
  conditions: EngineCondition<AudienceDefinitionFilter>[],
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
