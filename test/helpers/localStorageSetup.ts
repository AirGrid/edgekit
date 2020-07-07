import { PageView } from 'types';

// Not currently used, could help tests
export const pageViewCreator = (
  timestamp: number,
  keywords: Array<string>,
  numberOfPageViews: number
): Array<PageView> => {
  const pageViews = [];
  for (let index = 0; index < numberOfPageViews; index++) {
    pageViews.push({ ts: timestamp, features: { keywords } });
  }
  return pageViews;
};
