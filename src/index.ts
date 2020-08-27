import * as engine from './engine';
import { getPageFeatures } from './features';
import { viewStore, matchedAudienceStore } from './store';
import { timeStampInSecs } from './utils';
import { hasGdprConsent } from './gdpr';
import {
  PageFeatureGetter,
  MatchedAudience,
  AudienceDefinition,
} from '../types';

interface Config {
  pageFeatureGetters: PageFeatureGetter[];
  audienceDefinitions: AudienceDefinition[];
  vendorIds?: number[];
  omitGdprConsent?: boolean;
}

// TODO: we need to give a way to consumers to ensure this does not
// run multiple times on a single page load.
const run = async (config: Config): Promise<void> => {
  if (config.omitGdprConsent !== true) {
    const hasConsent = await hasGdprConsent(config.vendorIds);
    if (!hasConsent) return;
  }

  const { pageFeatureGetters, audienceDefinitions } = config;
  const pageFeatures = await getPageFeatures(pageFeatureGetters);
  viewStore.insert(pageFeatures);

  const matchedAudiences = audienceDefinitions
    .filter((audience) => {
      return !matchedAudienceStore.matchedAudienceIds.includes(audience.id);
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

  matchedAudienceStore.setMatchedAudiences(matchedAudiences);
};

const getMatchedAudiences = (): MatchedAudience[] => {
  return matchedAudienceStore.matchedAudiences;
};

export const edkt = {
  run,
  getMatchedAudiences,
};

// This will expose the exported audiences & allow tree shaking
export * from './audiences';
export * from './store';
export * from './gdpr';
export * from '../types';
