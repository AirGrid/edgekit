import { storage, timeStampInSecs } from '../utils';
import { PageView, StorageKeys, PageFeatureResult } from '../../types';

class ViewStore {
  pageViews: PageView[];
  maxAge: number;
  storageSize: number;

  constructor(maxAge?: number, storageSize?: number) {
    this.pageViews = [];
    // TODO define sane defaults for maxAge and storageSize and update tests it will break
    // this.maxAge = maxAge ?? 3600 * 24 * 30;
    // this.storageSize = storageSize ?? 10000;
    this.maxAge = maxAge ?? Infinity;
    this.storageSize = storageSize ?? Infinity;
    this._load();
    this._trim();
    this._save();
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
  }

  setMaxAge(maxAge?: number) {
    if (!maxAge || maxAge < 0 || maxAge === this.maxAge) return;
    this.maxAge = maxAge;
    this._trim();
    this._save();
  }

  setStoreSize(storageSize?: number) {
    if (!storageSize || storageSize < 0 || storageSize === this.storageSize)
      return;
    this.storageSize = storageSize;
    this._trim();
    this._save();
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
    this._trim();
    this._save();
  }
}

export const viewStore = new ViewStore();
