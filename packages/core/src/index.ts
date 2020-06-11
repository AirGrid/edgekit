import { getPageFeatures } from './features';
import { setAndReturnAllPageViews, updateMatchedAudiences } from './storage';

interface IConfig {
  pageFeatureGetters: IPageFeatureGetter[];
}

interface IPageFeatureGetter {
  name: string;
  func: () => Promise<string[]>;
}

const check = (conditions, pageViews) => {

}

export const edkt = async (config: IConfig) => {
  const { pageFeatureGetters } = config;
  const pageFeatures = await getPageFeatures(pageFeatureGetters);
  const pageViews = setAndReturnAllPageViews(pageFeatures);
  const matchedAudiences = check( ,pageViews);
  updateMatchedAudiences(matchedAudiences);
}
