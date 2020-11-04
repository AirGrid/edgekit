import * as engine from './engine';
import { getPageFeatures } from './features';
import { viewStore, matchedAudienceStore } from './store';
import { timeStampInSecs } from './utils';
import { waitForConsent } from './gdpr';
import {
  PageFeature,
  PageFeatureGetter,
  PageFeatureResult,
  MatchedAudience,
  AudienceDefinition,
  PageView,
} from '../types';

interface Config {
  pageFeatureGetters: PageFeatureGetter[];
  audienceDefinitions: AudienceDefinition[];
  vendorIds?: number[];
  omitGdprConsent?: boolean;
}

let savedPageFeatures: PageFeature[] = [];

const setPageFeatures = (features: Record<string, PageFeatureResult>): void => {
  const pageFeatures = Object.entries(features).map(
    ([name, { version, value }]) => ({
      name,
      value,
      version,
      error: false,
    })
  );
  savedPageFeatures = savedPageFeatures.concat(pageFeatures);
};

const run = async (config: Config): Promise<void> => {
  if (!config.omitGdprConsent) {
    const hasConsent = await waitForConsent(config.vendorIds);
    if (!hasConsent) return;
  }

  const { pageFeatureGetters, audienceDefinitions } = config;
  const pageFeatures = await getPageFeatures(pageFeatureGetters);
  viewStore.insert(savedPageFeatures.concat(pageFeatures));

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
        return audience.definition.lookBack === 0
          ? true
          : pageView.ts > currentTS - audience.definition.lookBack;
      });
      return {
        id: audience.id,
        matchedAt: currentTS,
        expiresAt: currentTS + audience.definition.ttl,
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

const getCopyOfPageViews = (): PageView[] => {
  return [...viewStore.pageViews];
};

export const edkt = {
  run,
  getMatchedAudiences,
  getCopyOfPageViews,
  setPageFeatures,
};

// This will expose the exported audiences & allow tree shaking
export * from './store';
export * from './gdpr';
export * from '../types';
