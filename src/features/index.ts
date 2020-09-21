import { PageFeatureGetter, PageFeature, PageFeatureValue } from '../../types';

const wrapPageFeatureGetters = (
  pageFeatureGetters: PageFeatureGetter[]
): Promise<PageFeature>[] => {
  return pageFeatureGetters.map((getter) => {
    return (async () => {
      let error: boolean;
      let value: PageFeatureValue;
      const { name } = getter;
      try {
        value = await getter.func();
        error = false;
      } catch (err) {
        value = [];
        error = true;
      }

      return { name, error, value };
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
