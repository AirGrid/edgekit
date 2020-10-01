import { PageFeatureGetter, PageFeature } from '../../types';

const wrapPageFeatureGetters = (
  pageFeatureGetters: PageFeatureGetter[]
): Promise<PageFeature>[] => {
  return pageFeatureGetters.map((getter) => {
    return (async (): Promise<PageFeature> => {
      const { name } = getter;
      try {
        const { version, value } = await getter.func();
        return { name, error: false, version, value };
      } catch (err) {
        return { name, error: true };
      }
    })();
  });
};

export const getPageFeatures = async (
  pageFeatureGetters: PageFeatureGetter[]
): Promise<PageFeature[]> => {
  const wrappedGetters = wrapPageFeatureGetters(pageFeatureGetters);
  const features = await Promise.all(wrappedGetters);
  return features;
};
