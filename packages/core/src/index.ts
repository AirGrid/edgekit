import * as engine from '@edgekit/engine';
import audiences from '@edgekit/audiences';
import { getPageFeatures } from './features';
import { viewStore, audienceStore } from './store';
import { timeStampInSecs } from './utils';

interface IConfig {
  pageFeatureGetters: IPageFeatureGetter[];
}

interface IPageFeatureGetter {
  name: string;
  func: () => Promise<string[]>;
}


// TODO: we need to give a way to consumers to ensure this does not
// run multiple times on a single page load.
const run = async (config: IConfig) => {
  const { pageFeatureGetters } = config;
  const pageFeatures = await getPageFeatures(pageFeatureGetters);
  viewStore.insert(pageFeatures);

  const matchedAudiences = audiences
    .filter((audience) => {
      return !audienceStore.matchedAudienceIds.includes(audience.id);
    })
    .map((audience) => {
      return {
        id: audience.id,
        matchedAt: timeStampInSecs(),
        expiresAt: timeStampInSecs() + audience.ttl,
        matched: engine.check(audience.conditions, viewStore.pageViews)
      }
    })
    .filter((audience) => audience.matched);
  
  audienceStore.setMatchedAudiences(matchedAudiences);
};

const stats = () => {
  return {};
}

export const edkt = {
  run,
  stats
}
