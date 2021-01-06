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
    featureStorageSize,
  } = config;

  if (!omitGdprConsent) {
    const hasConsent = await waitForConsent(vendorIds);
    if (!hasConsent) return;
  }

  // This is a no-op if undefined, equals current value or lesser than 0
  viewStore.setStorageSize(featureStorageSize);
  viewStore.insert(pageFeatures, pageMetadata);

  // for reuse
  const currentTS = timeStampInSecs();

  /* Should compute as follow:
   * - if a user has matched version 1, and the most recent audience version available is 1, we should not run the checking.
   * - if a user has matched version 1, and the most recent audience version available is 2, we should run the checking.
   * - if they not do not match the new version (2), but had matched 1, we must remove this audience from matched.
   * - if they matched v1 and now match on v2, they remain in the audience but with the updated version
   */

  const matchedAudiences = audienceDefinitions
    // first we check if audience was previously matched so we can skip reprocessing it
    .filter((audience) => {
      return !matchedAudienceStore.matchedAudienceIds.includes(audience.id);
    })
    // translate audience definitions into engine queries
    .map((audience) => {
      return {
        ...audience,
        conditions: engine.translate(audience),
      };
    })
    // check if query matches any pageViews
    .map((audience) => {
      const pageViewsWithinLookBack = viewStore.pageViews.filter((pageView) => {
        return audience.lookBack === 0
          ? true
          : pageView.ts > currentTS - audience.lookBack;
      });
      return {
        id: audience.id,
        version: audience.version,
        matchedAt: currentTS,
        expiresAt: currentTS + audience.ttl,
        matchedOnCurrentPageView: true,
        matched: engine.check(audience.conditions, pageViewsWithinLookBack),
      };
    })
    // keep only matched audiences
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
