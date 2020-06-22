// TODO: this is duplicated - move into types.
interface IPageFeatureGetter {
  name: string;
  func: () => Promise<string[]>;
}

const wrapPageFeatureGetters = (pageFeatureGetters: IPageFeatureGetter[]) => {
  return pageFeatureGetters.map((getter) => {
    return (async () => {
      let error: boolean;
      let value: string[];
      const { name } = getter;
      try {
        value = await getter.func();
        error = false;
      } catch (err) {
        value = [];
        error = true;
      }

      return {
        name,
        error,
        value,
      };
    })();
  });
};

export const getPageFeatures = async (
  pageFeatureGetters: IPageFeatureGetter[]
) => {
  const wrappedGetters = wrapPageFeatureGetters(pageFeatureGetters);
  const features = await Promise.all(wrappedGetters);
  return features;
};
