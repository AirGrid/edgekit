interface IPageView {
  ts: number;
  // TODO: how do we enforce / check that `keywords` is available?
  // It feels that this should happen early in the flow
  // when a user passes the getters.
  // keywords: string[];
}

interface IPageFeature {
  name: string;
  error: boolean;
  value: string[];
}

const createPageView = (pageFeatures: IPageFeature[]): IPageView | undefined => {
  const ts = Math.round(Date.now() / 1000);

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
    ...features
  }
};

/*
 * Returns an array of pageViews or an empty array.
 */
const getAllPageViews = (): IPageView[] => {
  try {
    return JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );
  } catch (e) {
    return [];
  }
};

/*
 * Creates a new pageView and stores it.
 */
export const setAndReturnAllPageViews = (pageFeatures: IPageFeature[]): IPageView[] => {
  const pageViews = getAllPageViews();
  const pageView = createPageView(pageFeatures);
  
  if (!pageView) return pageViews;
  pageViews.push(pageView);
  
  try {
    const serializedViews = JSON.stringify(pageViews);
    localStorage.setItem('edkt_page_views', serializedViews);
  } catch (e) {
    // ignore...
  }

  return pageViews;
};

/* export const updateMatchedAudiences = (audienceIds) => {
  try {
    const serializedAudiences = JSON.stringify(audienceIds);
    localStorage.setItem('edkt_matched_audiences', serializedAudiences);
  } catch (e) {
    // ignore...
  } 
} */
