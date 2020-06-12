import * as engine from '@edgekit/engine';
import { getPageFeatures } from './features';
import { setAndReturnAllPageViews, updateCheckedAudiences } from './storage';

import { audiences } from './audiences';

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
  console.log(pageViews);
  // TODO: avoid checking audiences the user is already in.
  const checkedAudiences = audiences.map(audience => {
    return {
      ...audience,
      matched: engine.check(audience.conditions, pageViews)
    }
  });
  updateCheckedAudiences(checkedAudiences);
}
