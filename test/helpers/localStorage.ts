import {
  PageView,
  MatchedAudience,
  MatchedAudiences,
} from '../../types';
import { viewStore, matchedAudienceStore } from '../../src/store';

export const clearStore = (): void => {
  localStorage.clear();
  //We need to reload from local storage because its only done on construction
  viewStore._load();
  matchedAudienceStore._load();
};

export const setUpLocalStorage = (pageViews: PageView[]): void => {
  localStorage.clear();
  localStorage.setItem('edkt_page_views', JSON.stringify(pageViews));
  // We need to reload from local storage because its only done on construction
  viewStore._load();
  matchedAudienceStore._load();
};

export const getPageViews = (): PageView[] =>
  JSON.parse(localStorage.getItem('edkt_page_views') || '[]');

export const getMatchedAudiences = (): MatchedAudience[] => {
  const matchedAudiences: MatchedAudiences = JSON.parse(
    localStorage.getItem('edkt_matched_audiences') || '{}'
  );
  // TODO: this code has been added for backward compat
  // https://github.com/AirGrid/edgekit/issues/152
  return Object.entries(matchedAudiences).map(([_, audience]) => audience);
};
