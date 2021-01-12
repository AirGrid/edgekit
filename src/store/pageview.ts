import { storage, timeStampInSecs } from '../utils';
import { PageView, StorageKeys, PageFeatureResult } from '../../types';

const DEFAULT_MAX_FEATURES_SIZE = 300;

export class ViewStore {
  private pageViews: PageView[];
  private storageSize: number;

  constructor() {
    this.pageViews = [];
    this.storageSize = DEFAULT_MAX_FEATURES_SIZE;
    this._load();
  }

  _load(): void {
    this.pageViews = storage.get(StorageKeys.PAGE_VIEWS) || [];
  }

  _save(): void {
    storage.set(StorageKeys.PAGE_VIEWS, this.pageViews);
  }

  _trim(): void {
    if (this.pageViews.length <= this.storageSize) return;
    this.pageViews.sort((a: PageView, b: PageView): number => b.ts - a.ts);
    this.pageViews = this.pageViews.slice(0, this.storageSize);
  }

  /**
   * @param storageSize Max pageView items to be kept
   */
  setStorageSize(storageSize?: number): void {
    if (!storageSize || storageSize < 0) return;
    this.storageSize = storageSize;
  }

  savePageViews(
    features: Record<string, PageFeatureResult> | undefined,
    metadata?: Record<string, string | number | boolean>
  ): void {
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

  getPageViewsWithinLookBack(lookBack: number): PageView[] {
    const ts = timeStampInSecs();
    return this.pageViews.filter((pageView) => {
      return lookBack === 0 || pageView.ts > ts - lookBack;
    });
  }

  getPageViews(): PageView[] {
    return [...this.pageViews];
  }
}

export const viewStore = new ViewStore();
