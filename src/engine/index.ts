import { evaluateCondition } from './evaluate';
import { timeStampInSecs } from '../utils';
import { translate } from './translate';
import {
  PageView,
  EngineCondition,
  AudienceDefinition,
  AudienceDefinitionFilter,
  MatchedAudience,
} from '../../types';

const check = (
  conditions: EngineCondition<AudienceDefinitionFilter>[],
  pageViews: PageView[],
  any = false
): boolean =>
  conditions[any ? 'some' : 'every']((condition) =>
    evaluateCondition(condition, pageViews)
  );

const getMatchingAudiences = (
  audienceDefinitions: AudienceDefinition[],
  pageViewsWithinLookBack: PageView[][]
): MatchedAudience[] => {
  const currentTS = timeStampInSecs();

  return audienceDefinitions.reduce((acc, audience, i) => {
    const conditions = translate(audience);
    const pageViews = pageViewsWithinLookBack[i];
    return check(conditions, pageViews)
      ? [
          ...acc,
          {
            id: audience.id,
            version: audience.version,
            matchedAt: currentTS,
            expiresAt: currentTS + audience.ttl,
            matchedOnCurrentPageView: true,
          },
        ]
      : acc;
  }, [] as MatchedAudience[]);
};

export { translate, check, getMatchingAudiences };
