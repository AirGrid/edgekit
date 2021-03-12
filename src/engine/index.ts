import { evaluateCondition } from './evaluate';
import { timeStampInSecs } from '../utils';
import { translate } from './translate';
import { PageView, AudienceDefinition, MatchedAudience } from '../../types';

const getMatchingAudiences = (
  audienceDefinitions: AudienceDefinition[],
  pageViews: PageView[]
): MatchedAudience[] => {
  const currentTS = timeStampInSecs();

  return audienceDefinitions.reduce((acc, audience) => {
    const condition = translate(audience);
    const pageViewsWithinLookBack = pageViews.filter(
      (pageView) =>
        audience.lookBack === 0 || pageView.ts > currentTS - audience.lookBack
    );
    return evaluateCondition(condition, pageViewsWithinLookBack)
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

export { translate, evaluateCondition, getMatchingAudiences };
