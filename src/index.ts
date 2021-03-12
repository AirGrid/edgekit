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

  matchedAudienceStore.unsetAudiencesIfVersionIncremented(audienceDefinitions);

  const audiencesToMatch = audienceDefinitions.filter((audience) => {
    return !matchedAudienceStore.isMatched(audience.id, audience.version);
  });

  const matchedAudiences = engine.getMatchingAudiences(
    audiencesToMatch,
    pageViews
  );

  matchedAudienceStore.setAudiences(matchedAudiences);
};

export const edkt: Edkt = {
  run,
  getMatchedAudiences: () => matchedAudienceStore.getMatchedAudiences(),
  getCopyOfPageViews: () => viewStore.getCopyOfPageViews(),
};

export * from './store';
export * from './gdpr';
export * from '../types';
