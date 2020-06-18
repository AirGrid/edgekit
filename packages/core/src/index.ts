import * as engine from '@edgekit/engine';
import { getPageFeatures } from './features';
import { 
  setAndReturnAllPageViews, 
  // updateCheckedAudiences, 
  // getAndPurgeMatchedAudiences 
} from './storage';

import { timeStampInSecs } from './utils';

import { audienceStore } from './store';

import { audiences } from './audiences';

interface IConfig {
  pageFeatureGetters: IPageFeatureGetter[];
}

interface IPageFeatureGetter {
  name: string;
  func: () => Promise<string[]>;
}


// TODO: we need to give a way to consumers to ensure this does not
// run multiple times on a single page load.
export const edkt = async (config: IConfig) => {
  const { pageFeatureGetters } = config;
  const pageFeatures = await getPageFeatures(pageFeatureGetters);
  const pageViews = setAndReturnAllPageViews(pageFeatures);

  const previouslyMatchedAudienceIds = audienceStore.getMatchedAudienceIds();

  const matchedAudiences = audiences
    .filter((audience) => {
      return !previouslyMatchedAudienceIds.includes(audience.id);
    })
    .map((audience) => {
      return {
        id: audience.id,
        matchedAt: timeStampInSecs(),
        expiresAt: timeStampInSecs() + audience.ttl,
        matched: engine.check(audience.conditions, pageViews)
      }
    })
    .filter((audience) => audience.matched);

  audienceStore.setMatchedAudiences(matchedAudiences);

};
