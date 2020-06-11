import { IPageView } from './types';

export const count = () => (ls: IPageView[]): number => ls.length;

export const sum = (property: string) => (pageViews: IPageView[]): number =>
  pageViews.reduce((acc, pageView) => Number(acc + pageView[property]), 0);

export const avg = (property: string) => (pageViews: IPageView[]): number =>
  sum(property)(pageViews) / pageViews.length;

export const min = (property: string) => (pageViews: IPageView[]): number =>
  Math.min(...pageViews.map(pageView => pageView[property]));

export const max = (property: string) => (pageViews: IPageView[]): number =>
  Math.max(...pageViews.map(pageView => pageView[property]));
