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

  // This is a no-op if undefined or lesser than 0
  viewStore.setStorageSize(featureStorageSize);
  viewStore.insert(pageFeatures, pageMetadata);

  const currentTS = timeStampInSecs();

  const newMatchedAudiences = audienceDefinitions
    // drop prev matched audiences with same version
    .filter((audience) => {
      return !matchedAudienceStore.matchedAudiences.some(
        ({ id, version }) => audience.id === id && version === audience.version
      );
    })
    // translate audience definitions into engine queries
    .map((audience) => {
      return {
        ...audience,
        conditions: engine.translate(audience),
      };
    })
    // check if query matches any pageViews
    .map((query) => {
      const pageViewsWithinLookBack = viewStore.pageViews.filter((pageView) => {
        return query.lookBack === 0
          ? true
          : pageView.ts > currentTS - query.lookBack;
      });
      return {
        id: query.id,
        version: query.version,
        matchedAt: currentTS,
        expiresAt: currentTS + query.ttl,
        matchedOnCurrentPageView: true,
        matched: engine.check(query.conditions, pageViewsWithinLookBack),
      };
    })
    // keep only matched audiences
    .filter((audience) => audience.matched);

  // We also want to keep prev matched audiences with matching versions
  const prevMatchedAudiences = matchedAudienceStore.matchedAudiences.filter(
    (matched) =>
      audienceDefinitions.some(
        ({ id, version }) => matched.id === id && matched.version === version
      )
  );

  const matchedAudiences = [...prevMatchedAudiences, ...newMatchedAudiences];

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
