import { storage, timeStampInSecs } from '../utils';
import {
  PageView,
  StorageKeys,
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

  insert(features: Record<string, PageFeatureResult> | undefined, metadata?: Record<string, string | number | boolean>) {
    if (!features || Object.keys(features).length < 1) return;
    const ts = timeStampInSecs();
    const pageView = {
      ts,
      features,
      ...metadata
    }
    this.pageViews.push(pageView);
    this._save();
  }
}

export const viewStore = new ViewStore();
