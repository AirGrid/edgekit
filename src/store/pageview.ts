import { storage, timeStampInSecs } from '../utils';
import { PageView, StorageKeys, PageFeatureResult } from '../../types';

class ViewStore {
  pageViews: PageView[];
  maxAge: number;
  storageSize: number;

  constructor(maxAge: number, storageSize: number) {
    this.pageViews = [];
    this._trim();
    this.maxAge = maxAge;
    this.storageSize = storageSize;
  }

  setMaxAge(maxAge: number) {
    if (maxAge < 0) return
    this.maxAge = maxAge;
    this._trim()
  }

  setStoreSize(storageSize: number) {
    if (storageSize < 0) return
    this.storageSize = storageSize;
    this._trim()
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
      (a: PageView, b: PageView): number => b.ts - a.ts
    )
    const filteredPageViews = pageViews.filter(
      (pageView: PageView, i: number) =>
        pageView.ts > timeStampInSecs() - this.maxAge && i < this.storageSize
    )
    storage.set(
      StorageKeys.PAGE_VIEWS,
      filteredPageViews
    )
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

// defaults to 10 days old and 10k items storageSize
export const viewStore = new ViewStore(3600 * 24 * 30, 10000);
