import { storage, timeStampInSecs } from '../utils';
import { PageView, StorageKeys, PageFeatureResult } from '../../types';

class ViewStore {
  pageViews: PageView[];
  maxAge: number;
  storageSize: number;

  constructor(maxAge: number, storageSize: number) {
    this.pageViews = [];
    this.maxAge = maxAge;
    this.storageSize = storageSize;
    this._load();
    this._trim();
  }

  _load() {
    this.pageViews = storage.get(StorageKeys.PAGE_VIEWS) || [];
  }

  _save() {
    storage.set(StorageKeys.PAGE_VIEWS, this.pageViews);
  }

  _trim() {
    this.pageViews.sort((a: PageView, b: PageView): number => b.ts - a.ts);
    this.pageViews = this.pageViews.filter(
      (pageView: PageView, i: number) =>
        pageView.ts > timeStampInSecs() - this.maxAge && i < this.storageSize
    );
    this._save();
  }

  setMaxAge(maxAge: number) {
    if (maxAge < 0) return;
    this.maxAge = maxAge;
    this._trim();
  }

  setStoreSize(storageSize: number) {
    if (storageSize < 0) return;
    this.storageSize = storageSize;
    this._trim();
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
