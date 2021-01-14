import { viewStore, matchedAudienceStore } from './store';
import { engine } from './engine';
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

  viewStore.savePageViews(pageFeatures, pageMetadata);

  const matchedAudiences = engine(
    audienceDefinitions,
    matchedAudienceStore,
    viewStore
  );

  matchedAudienceStore.setMatchedAudiences(matchedAudiences);
};

export const edkt: Edkt = {
  run,
  getMatchedAudiences: () => matchedAudienceStore.getMatchedAudiences(),
  getCopyOfPageViews: () => viewStore.getPageViews(),
};

export * from './store';
export * from './gdpr';
export * from '../types';
