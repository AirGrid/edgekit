import { storage, timeStampInSecs } from '../utils';
import {
  PageView,
  StorageKeys,
  PageFeature,
  PageFeatureResult,
} from '../../types';

class ViewStore {
  pageViews: PageView[];

  constructor() {
    this.pageViews = [];
    this._load();
  }

  _load() {
    this.pageViews = storage.get(StorageKeys.PAGE_VIEWS) || [];
  }

  _save() {
    storage.set(StorageKeys.PAGE_VIEWS, this.pageViews);
  }

  _formatIntoPageView(pageFeatures: PageFeature[]): PageView | undefined {
    const ts = timeStampInSecs();

    const features = pageFeatures.reduce((acc, item) => {
      if (!item.error) {
        const { name, version, value } = item;
        acc[name] = { version, value };
        return acc;
      }
      return acc;
    }, {} as Record<string, PageFeatureResult>);

    if (Object.keys(features).length < 1) return undefined;

    return {
      ts,
      features,
    };
  }

  insert(pageFeatures: PageFeature[]) {
    const pageView = this._formatIntoPageView(pageFeatures);
    if (!pageView) return;
    this.pageViews.push(pageView);
    this._save();
  }
}

export const viewStore = new ViewStore();
