import {
  PageFeatureGetter,
  PageFeature,
  PageFeatureValue,
  PageFeatureKeyword,
  PageFeatureTopicModel,
  PageFeatureCustom,
} from '../../types';

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

      if (name === 'keyword' && value instanceof Array) {
        const pageFeatureKeyword: PageFeatureKeyword = { name, error, value };
        return pageFeatureKeyword;
      } else if (
        name === 'topicModelFeatures' &&
        !(value instanceof Array) &&
        value instanceof Object &&
        typeof value.vector === 'number' &&
        typeof value.version === 'number'
      ) {
        const pageFeatureTopicModel: PageFeatureTopicModel = {
          name,
          error,
          value,
        };
        return pageFeatureTopicModel;
      } else {
        const pageFeatureCustom: PageFeatureCustom<T> = { name, error, value };
        return pageFeatureCustom;
      }
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
