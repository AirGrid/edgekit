import { evaluateCondition } from './evaluate';
import { timeStampInSecs } from '../utils';
import { translate } from './translate';
import { ViewStore, MatchedAudienceStore } from '../store';
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
): boolean => {
  const checkedConditions = conditions.map((condition) =>
    evaluateCondition(condition, pageViews)
  );

  return any
    ? checkedConditions.includes(true)
    : !checkedConditions.includes(false);
};

const doesAudienceVersionMatch = (
  audience: AudienceDefinition,
  matchedAudience: MatchedAudience
) =>
  audience.id === matchedAudience.id &&
  audience.version === matchedAudience.version;

const engine = (
  audienceDefinitions: AudienceDefinition[],
  matchedAudienceStore: MatchedAudienceStore,
  viewStore: ViewStore
): MatchedAudience[] => {
  const currentTS = timeStampInSecs();

  const matchedAudiences = matchedAudienceStore.getMatchedAudiences();

  const newlyMatchedAudiences = audienceDefinitions
    // drop prev matched audiences with same version
    .filter((audience) => {
      return !matchedAudiences.some((matchedAudience) =>
        doesAudienceVersionMatch(audience, matchedAudience)
      );
    })
    // translate audience definitions into engine queries
    .map((audience) => {
      return {
        ...audience,
        conditions: translate(audience),
      };
    })
    // check if query matches any pageViews
    .map((query) => {
      const pageViewsWithinLookBack = viewStore.getPageViewsWithinLookBack(
        query.lookBack
      );
      return {
        id: query.id,
        version: query.version,
        matchedAt: currentTS,
        expiresAt: currentTS + query.ttl,
        matchedOnCurrentPageView: true,
        matched: check(query.conditions, pageViewsWithinLookBack),
      };
    })
    // keep only matched audiences
    .filter((audience) => audience.matched);

  // We also want to keep prev matched audiences with matching versions
  const prevMatchedAudiences = matchedAudiences.filter((matchedAudience) =>
    audienceDefinitions.some((audience) =>
      doesAudienceVersionMatch(audience, matchedAudience)
    )
  );

  return [...prevMatchedAudiences, ...newlyMatchedAudiences];
};

export { translate, check, engine };
