import { storage, timeStampInSecs } from '../utils';
import { PageView, StorageKeys, PageFeatureResult } from '../../types';

const DEFAULT_MAX_FEATURES_SIZE = 300;

class ViewStore {
  pageViews: PageView[];
  storageSize: number;

  constructor() {
    this.pageViews = [];
    this.storageSize = DEFAULT_MAX_FEATURES_SIZE;
    this._load();
  }

  _load() {
    this.pageViews = storage.get(StorageKeys.PAGE_VIEWS) || [];
  }

  _save() {
    storage.set(StorageKeys.PAGE_VIEWS, this.pageViews);
  }

  _trim() {
    if (this.pageViews.length <= this.storageSize) return;
    this.pageViews.sort((a: PageView, b: PageView): number => b.ts - a.ts);
    this.pageViews = this.pageViews.slice(0, this.storageSize);
  }

  /**
   * @param storageSize Max pageView items to be kept
   */
  setStorageSize(storageSize?: number) {
    if (!storageSize || storageSize < 0) return;
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

export const viewStore = new ViewStore();
