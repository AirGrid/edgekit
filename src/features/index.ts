import { PageFeatureGetter, PageFeature, PageFeatureValue } from '../../types';
import { isStringArray, isNumberArray } from '../utils';

const wrapPageFeatureGetters = <T>(
  pageFeatureGetters: PageFeatureGetter<T>[]
): Promise<PageFeature<T>>[] => {
  return pageFeatureGetters.map((getter) => {
    return (async () => {
      let error: boolean;
      let value: PageFeatureValue<T>;
      const { name } = getter;
      try {
        value = await getter.func();
        error = false;
      } catch (err) {
        value = [];
        error = true;
      }

      return name === 'keyword' && isStringArray(value)
        ? { name, error, value }
        : name === 'topicDist' && isNumberArray(value)
        ? { name, error, value }
        : { name, error, value };
    })();
  });
};

export const getPageFeatures = async <T>(
  pageFeatureGetters: PageFeatureGetter<T>[]
): Promise<PageFeature<T>[]> => {
  const wrappedGetters = wrapPageFeatureGetters<T>(pageFeatureGetters);
  const features = await Promise.all(wrappedGetters);
  return features;
};
