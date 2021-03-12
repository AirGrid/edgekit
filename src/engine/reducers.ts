import { PageView } from '../../types';

export const count = () => (pageViews: PageView[]): number => pageViews.length;
