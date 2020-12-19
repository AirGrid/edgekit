import { evaluateCondition } from './evaluate';
import { translate } from './translate';
import {
  PageView,
  EngineCondition,
  AudienceDefinitionFilter,
} from '../../types';

const check = (
  conditions: EngineCondition<AudienceDefinitionFilter>[],
  pageViews: PageView[],
  any = false
): boolean => {
  // Instead of going through the entire array again with an `.includes`
  // method call, let's check _during_ other operations. This has a
  // potential savings of `n` | n => conditions.length.
  if (any) {
    for (const condition of conditions) {
      if (evaluateCondition(condition, pageViews)) {
        return true;
      }
    }
  }

  // If we need all of the pageViews to satisfy `condition`
  const conditionsTotal = conditions.length;
  let conditionsMet = 0;
  for (const condition of conditions) {
    if (conditionsMet === conditionsTotal) {
      return true;
    }
    if (evaluateCondition(condition, pageViews)) {
      conditionsMet += 1;
    }
  }

  // Our conditions were not met, so we default to failure
  return false;
};

export { translate, check };
