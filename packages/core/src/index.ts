import * as engine from '@edgekit/engine';
import { getPageFeatures } from './features';
import { setAndReturnAllPageViews, updateMatchedAudiences } from './storage';

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
  const matchedAudiences = engine.check( ,pageViews);
  updateMatchedAudiences(matchedAudiences);
}
