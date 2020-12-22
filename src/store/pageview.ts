import { storage, timeStampInSecs } from '../utils';
import { PageView, StorageKeys, PageFeatureResult } from '../../types';

class ViewStore {
  pageViews: PageView[];
  maxAge: number;
  storageSize: number;

  /**
   * @param maxAge Max pageView age to be kept in seconds
   * @param storageSize Max pageView items to be kept
   */
  constructor(maxAge?: number, storageSize?: number) {
    this.pageViews = [];
    this.maxAge = maxAge ?? Infinity;
    this.storageSize = storageSize ?? Infinity;
    this._load();
  }

  _load() {
    this.pageViews = storage.get(StorageKeys.PAGE_VIEWS) || [];
  }

  _save() {
    storage.set(StorageKeys.PAGE_VIEWS, this.pageViews);
  }

  _trim() {
    const validUntil = timeStampInSecs() - this.maxAge;
    this.pageViews.sort((a: PageView, b: PageView): number => b.ts - a.ts);
    this.pageViews = this.pageViews.filter(
      (pageView: PageView, i: number) =>
        pageView.ts > validUntil && i < this.storageSize
    );
  }

  /**
   * @param maxAge Max pageView age to be kept in seconds
   */
  setMaxAge(maxAge?: number) {
    if (!maxAge || maxAge < 0 || maxAge === this.maxAge) return;
    this.maxAge = maxAge;
  }

  /**
   * @param storageSize Max pageView items to be kept
   */
  setStoreSize(storageSize?: number) {
    if (!storageSize || storageSize < 0 || storageSize === this.storageSize)
      return;
    this.storageSize = storageSize;
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

export const viewStore = new ViewStore(3600 * 24 * 45, 300);
