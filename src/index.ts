import { viewStore, matchedAudienceStore } from './store';
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

  // TODO the problem here is that it is not immediately clear
  // that call order for viewStore.savePageViews and
  // matchedAudienceStore.saveMatchingAudiences matters,
  // but it do.
  viewStore.savePageViews(pageFeatures, pageMetadata);

  matchedAudienceStore.saveMatchingAudiences(audienceDefinitions, viewStore);
};

export const edkt: Edkt = {
  run,
  getMatchedAudiences: () => matchedAudienceStore.getMatchedAudiences(),
  getCopyOfPageViews: () => viewStore.getPageViews(),
};

export * from './store';
export * from './gdpr';
export * from '../types';
