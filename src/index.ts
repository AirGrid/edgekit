import * as engine from './engine';
import { viewStore, matchedAudienceStore } from './store';
import { timeStampInSecs } from './utils';
import { waitForConsent } from './gdpr';
import { Edkt } from '../types';

const run: Edkt['run'] = async (config) => {
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

const getMatchedAudiences: Edkt['getMatchedAudiences'] = () => {
  return matchedAudienceStore.matchedAudiences;
};

const getCopyOfPageViews: Edkt['getCopyOfPageViews'] = () => {
  return [...viewStore.pageViews];
};

export const edkt: Edkt = {
  run,
  getMatchedAudiences,
  getCopyOfPageViews,
};

export * from './store';
export * from './gdpr';
export * from '../types';
