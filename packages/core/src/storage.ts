import { IPageView } from '@edgekit/types';

interface IPageFeature {
  name: string;
  error: boolean;
  value: string[];
}

enum StorageKeys {
  PAGE_VIEWS = 'edkt_page_views',
  MATCHED_AUDIENCES = 'edkt_matched_audiences',
}

const get = (key: string) => {
  const value = localStorage.getItem(key);
  if (!value) return undefined;
  
  try {
    return JSON.parse(value);
  } catch (e) {
    return undefined;
  }
};

const set = (key: string, value: object) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (e) {
    // ignore...
  }
};

const timeStampInSecs = (): number => Math.round(Date.now() / 1000);

/*
 * Creates an IPageView to be stored locally.
 */
const createPageView = (pageFeatures: IPageFeature[]): IPageView | undefined => {
  const ts = timeStampInSecs();

  const features = pageFeatures.reduce((acc, item) => {
    if (!item.error) {
      acc[item.name] = item.value;
      return acc;
    }
    return acc;
  }, {} as Record<string, string[]>);

  if (Object.keys(features).length < 1) return undefined;

  return {
    ts,
    features
  }
};

/*
 * Returns an array of pageViews or an empty array.
 */
const getAllPageViews = (): IPageView[] => get(StorageKeys.PAGE_VIEWS) || [];

/*
 * Creates a new pageView and stores it.
 */
export const setAndReturnAllPageViews = (pageFeatures: IPageFeature[]): IPageView[] => {
  const pageViews = getAllPageViews();
  const pageView = createPageView(pageFeatures);
  
  if (!pageView) return pageViews;
  pageViews.push(pageView);
  
  set(StorageKeys.PAGE_VIEWS, pageViews)

  return pageViews;
};
