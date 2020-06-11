import { IPageView } from './types';

export const count = () => (pageViews: IPageView[]): number => pageViews.length;

// TODO: these are not being used in edgekit, but they are in our project
// need to figure out how to make them compatible with typescript...

/* export const sum = (property: string) => (pageViews: IPageView[]): number =>
  pageViews.reduce((acc, pageView) => Number(acc + pageView.features[property]), 0);

export const avg = (property: string) => (pageViews: IPageView[]): number =>
  sum(property)(pageViews) / pageViews.length;

export const min = (property: string) => (pageViews: IPageView[]): number =>
  Math.min(...pageViews.map(pageView => pageView[property]));

export const max = (property: string) => (pageViews: IPageView[]): number =>
  Math.max(...pageViews.map(pageView => pageView[property])); */
