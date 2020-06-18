import { IPageView } from '@edgekit/types';
import { storage, timeStampInSecs } from '../utils';

enum StorageKeys {
  PAGE_VIEWS = 'edkt_page_views',
  MATCHED_AUDIENCES = 'edkt_matched_audiences',
  MATCHED_AUDIENCE_IDS = 'edkt_matched_audience_ids',
}

interface IPageFeature {
  name: string;
  error: boolean;
  value: string[];
}

class PageviewStore {
  entries: IPageView[];

  constructor() {
    this.entries = [];
    this._load();
  }

  _load() {
    this.entries = storage.get(StorageKeys.PAGE_VIEWS) || [];
  }

  _save() {
    storage.set(StorageKeys.PAGE_VIEWS, this.entries);
  }

  _formatIntoPageView(pageFeatures: IPageFeature[]) {
    const ts = timeStampInSecs();

    const features = pageFeatures.reduce((acc, item) => {
      if (!item.error) {
        acc[item.name] = item.value;
        return acc;
      }
      return acc;
    }, {} as Record<string, string[]>);
  
    if (Object.keys(features).length < 1) return undefined;
  
    return {
      ts,
      features
    }
  }

  insert(pageFeatures: IPageFeature[]) {
    const pageview = this._formatIntoPageView(pageFeatures);
    if (!pageview) return;
    this.entries.push(pageview);
    this._save();
  }
}

export const pageviewStore = new PageviewStore();
