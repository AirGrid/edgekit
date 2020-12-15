import { PageView } from '../../types';
import { viewStore, matchedAudienceStore } from '../../src/store';

export const pageViewCreator = (
  timestamp: number,
  keywords: Array<string>,
  numberOfPageViews: number
): Array<PageView> => {
  const pageViews = [];
  for (let index = 0; index < numberOfPageViews; index++) {
    pageViews.push({
      ts: timestamp,
      features: {
        keywords: {
          version: 1,
          value: keywords,
        },
      },
    });
  }
  return pageViews;
};

export const clearStore = () => {
  localStorage.clear()
  //We need to reload from local storage because its only done on construction
  viewStore._load();
  matchedAudienceStore._load();
}

export const getPageViews = () => JSON.parse(
  localStorage.getItem('edkt_page_views') || '[]'
);

export const getMatchedAudiences = () => JSON.parse(
  localStorage.getItem('edkt_matched_audiences') || '[]'
);

export const getCachedAudiences = () => JSON.parse(
  localStorage.getItem('edkt_cached_audiences') || '[]'
);

export const getCachedAudiencesMetaData = () => JSON.parse(
  localStorage.getItem('edkt_cached_audience_meta_data') || '[]'
);
