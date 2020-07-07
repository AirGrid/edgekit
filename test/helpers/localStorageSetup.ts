import { PageView } from 'types';

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
