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
  return conditions[any ? 'some' : 'every']((condition) =>
    evaluateCondition(condition, pageViews)
  );
};

export { translate, check };
