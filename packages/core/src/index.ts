import * as engine from '@edgekit/engine';
import { getPageFeatures } from './features';
import { setAndReturnAllPageViews, /*updateMatchedAudiences*/ } from './storage';

import { travelAudience } from './audiences';

interface IConfig {
  pageFeatureGetters: IPageFeatureGetter[];
}

interface IPageFeatureGetter {
  name: string;
  func: () => Promise<string[]>;
}

export const edkt = async (config: IConfig) => {
  const { pageFeatureGetters } = config;
  const pageFeatures = await getPageFeatures(pageFeatureGetters);
  const pageViews = setAndReturnAllPageViews(pageFeatures);
  const matchedAudiences = engine.check(travelAudience.conditions ,pageViews);
  console.log(matchedAudiences);
  // updateMatchedAudiences(matchedAudiences);
}
