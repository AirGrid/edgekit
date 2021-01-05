import { evaluateCondition } from './evaluate';
import { translate } from './translate';
import { PageView, EngineCondition, AudienceDefinitionFilter } from 'types';

const check = (
  conditions: EngineCondition<AudienceDefinitionFilter>[],
  pageViews: PageView[],
  any = false
): boolean => {
  const checkedConditions = conditions.map((condition) =>
    evaluateCondition(condition, pageViews)
  );

  return any
    ? checkedConditions.includes(true)
    : !checkedConditions.includes(false);
};

export { translate, check };
