interface IPageView {
  ts: number;
  features: {};
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

interface ICheckedAudience {
  id: string;
  matched: boolean;
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
    features
    // ...features
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
  console.log('views: ', pageViews)
  return pageViews;
};

export const updateCheckedAudiences = (checkedAudiences: ICheckedAudience[]) => {
  const updatedAudiences: Record<string, object> = {};
  const matchedAudiences = checkedAudiences.filter(audience => audience.matched);
  console.log('checked!!!', checkedAudiences);
  console.log('matched!!!', matchedAudiences);
  const previouslyMatchedAudiences = get('edkt_matched_audiences') || {};
  
  matchedAudiences.forEach((audience) => {
    if (audience.id in previouslyMatchedAudiences) {
      // update the ttl
    } else {
      updatedAudiences[audience.id] = audience;
    }
  });

  set('edkt_matched_audiences', updatedAudiences);
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
