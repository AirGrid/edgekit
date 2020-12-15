import * as engine from './engine';
import { viewStore, matchedAudienceStore } from './store';
import { timeStampInSecs } from './utils';
import { waitForConsent } from './gdpr';
import {
  PageFeatureResult,
  MatchedAudience,
  AudienceDefinition,
  PageView,
} from '../types';

interface Config {
  audienceDefinitions: AudienceDefinition[];
  pageFeatures?: Record<string, PageFeatureResult>;
  pageMetadata?: Record<string, string | number | boolean>;
  vendorIds?: number[];
  omitGdprConsent?: boolean;
}

const run = async (config: Config): Promise<void> => {
  const {
    vendorIds,
    pageFeatures,
    pageMetadata,
    omitGdprConsent,
    audienceDefinitions,
  } = config;

  if (!omitGdprConsent) {
    const hasConsent = await waitForConsent(vendorIds);
    if (!hasConsent) return;
  }

  viewStore.insert(pageFeatures, pageMetadata);

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
};

export * from './store';
export * from './gdpr';
export * from '../types';
