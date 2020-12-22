import { storage, timeStampInSecs } from '../utils';
import { PageView, StorageKeys, PageFeatureResult } from '../../types';

class ViewStore {
  pageViews: PageView[];
  maxAge: number;

  constructor(maxAge: number) {
    this.pageViews = [];
    this._trim();
    this._load();
    this.maxAge = maxAge;
  }

  _load() {
    this.pageViews = storage.get(StorageKeys.PAGE_VIEWS) || [];
  }

  _save() {
    storage.set(StorageKeys.PAGE_VIEWS, this.pageViews);
  }

  _trim() {
    const pageViews = storage.get(StorageKeys.PAGE_VIEWS) || [];
    pageViews.sort(
      (a: PageView, b: PageView): number => a.ts - b.ts
    )
    const filteredPageViews = pageViews.filter(
      (pageView: PageView) => pageView.ts > timeStampInSecs() - this.maxAge
    )
    storage.set(StorageKeys.PAGE_VIEWS, filteredPageViews)
    this._load()
  }

  insert(
    features: Record<string, PageFeatureResult> | undefined,
    metadata?: Record<string, string | number | boolean>
  ) {
    if (!features || Object.keys(features).length < 1) return;
    const ts = timeStampInSecs();
    const pageView = {
      ts,
      features,
      ...metadata,
    };
    this.pageViews.push(pageView);
    this._save();
  }
}

export const viewStore = new ViewStore(1000);
