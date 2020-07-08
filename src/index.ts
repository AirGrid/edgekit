import * as engine from './engine';
import { getPageFeatures } from './features';
import { viewStore, audienceStore } from './store';
import { timeStampInSecs } from './utils';
import { PageFeatureGetter, MatchedAudience, AudienceDefinition } from 'types';

interface Config {
  pageFeatureGetters: PageFeatureGetter[];
  audienceDefinitions: AudienceDefinition[];
}

// TODO: we need to give a way to consumers to ensure this does not
// run multiple times on a single page load.
const run = async (config: Config): Promise<void> => {
  const { pageFeatureGetters, audienceDefinitions } = config;
  const pageFeatures = await getPageFeatures(pageFeatureGetters);
  viewStore.insert(pageFeatures);

  const matchedAudiences = audienceDefinitions
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
      const currentTS = timeStampInSecs();
      const pageViewsWithinLookBack = viewStore.pageViews.filter((pageView) => {
        return audience.lookBack === 0
          ? true
          : pageView.ts > currentTS - audience.lookBack;
      });
      return {
        id: audience.id,
        matchedAt: currentTS,
        expiresAt: currentTS + audience.ttl,
        matchedOnCurrentPageView: true,
        matched: engine.check(audience.conditions, pageViewsWithinLookBack),
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

// This will expose the exported audiences & allow tree shaking
export * from './audiences';
