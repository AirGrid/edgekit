import { viewStore, matchedAudienceStore } from './store';
import * as engine from './engine';
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

  viewStore.setStorageSize(featureStorageSize);
  viewStore.savePageView(pageFeatures, pageMetadata);

  const pageViews = viewStore.getCopyOfPageViews();

  // match only the new audiences
  const definitionsToMatch = matchedAudienceStore.filterNewAudienceDefinitions(
    audienceDefinitions
  );
  const matchedAudiences = engine.getMatchingAudiences(
    definitionsToMatch,
    pageViews
  );

  matchedAudienceStore.updateMatchedAudiences(
    matchedAudiences,
    audienceDefinitions
  );
};

export const edkt: Edkt = {
  run,
  getMatchedAudiences: () => matchedAudienceStore.getMatchedAudiences(),
  getCopyOfPageViews: () => viewStore.getCopyOfPageViews(),
};

export * from './store';
export * from './gdpr';
export * from '../types';
