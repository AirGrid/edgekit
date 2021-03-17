import { PageView, MatchedAudience } from '../../types';
import { viewStore, matchedAudienceStore } from '../../src/store';
import { StorageKeys } from '../../types';
import { storage } from '../../src/utils';

export const clearStore = (): void => {
  localStorage.clear();
  //We need to reload from local storage because its only done on construction
  viewStore._load();
  matchedAudienceStore._load();
};

export const setUpLocalStorage = (pageViews: PageView[]): void => {
  localStorage.clear();
  storage.set(StorageKeys.PAGE_VIEWS, pageViews);
  // We need to reload from local storage because its only done on construction
  viewStore._load();
  matchedAudienceStore._load();
};

export const getPageViews = (): PageView[] =>
  storage.get(StorageKeys.PAGE_VIEWS);

export const getMatchedAudiences = (): MatchedAudience[] => {
  const matchedAudiences: MatchedAudience = storage.get(
    StorageKeys.MATCHED_AUDIENCES
  );
  // TODO: this code has been added for backward compat
  // https://github.com/AirGrid/edgekit/issues/152
  return Object.entries(matchedAudiences).map(([_, audience]) => audience);
};

export const getMatchedAudienceIds = (): string[] =>
  storage.get(StorageKeys.MATCHED_AUDIENCE_IDS);
