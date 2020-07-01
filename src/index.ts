import * as engine from './engine';
import { allAudienceDefinitions } from './audiences';
import { getPageFeatures } from './features';
import { viewStore, audienceStore } from './store';
import { timeStampInSecs } from './utils';
import { PageFeatureGetter, MatchedAudience } from 'types';

interface Config {
  pageFeatureGetters: PageFeatureGetter[];
}

// TODO: we need to give a way to consumers to ensure this does not
// run multiple times on a single page load.
const run = async (config: Config): Promise<void> => {
  const { pageFeatureGetters } = config;
  const pageFeatures = await getPageFeatures(pageFeatureGetters);
  viewStore.insert(pageFeatures);

  const matchedAudiences = allAudienceDefinitions
    .filter((audience) => {
      return !audienceStore.matchedAudienceIds.includes(audience.id);
    })
    .map((audience) => {
      return {
        ...audience,
        conditions: engine.translate(audience),
      };
    })
    .map((audience) => {
      return {
        id: audience.id,
        matchedAt: timeStampInSecs(),
        expiresAt: timeStampInSecs() + audience.ttl,
        matchedOnCurrentPageView: true,
        matched: engine.check(audience.conditions, viewStore.pageViews),
      };
    })
    .filter((audience) => audience.matched);

  audienceStore.setMatchedAudiences(matchedAudiences);
};

const getMatchedAudiences = (): MatchedAudience[] => {
  return audienceStore.matchedAudiences;
};

export const edkt = {
  run,
  getMatchedAudiences,
};
