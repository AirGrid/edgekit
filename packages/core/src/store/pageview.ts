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

class ViewStore {
  pageViews: IPageView[];

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
      features,
    };
  }

  insert(pageFeatures: IPageFeature[]) {
    const pageView = this._formatIntoPageView(pageFeatures);
    if (!pageView) return;
    this.pageViews.push(pageView);
    this._save();
  }
}

export const viewStore = new ViewStore();
