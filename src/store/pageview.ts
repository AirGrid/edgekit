import { storage, timeStampInSecs } from '../utils';
import {
  PageView,
  StorageKeys,
  PageFeature,
  PageFeatureValue,
  TopicModelFeature,
} from '../../types';

class ViewStore<T> {
  pageViews: PageView<T>[];

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

  _formatIntoPageView<T>(
    pageFeatures: PageFeature<T>[]
  ): PageView<T> | undefined {
    const ts = timeStampInSecs();

    let keywords: string[] | null = null;
    let topicModel: TopicModelFeature | undefined = undefined;
    const otherFeatures: Record<string, PageFeatureValue<T>> = {};
    for (const pageFeature of pageFeatures) {
      if (!pageFeature.error) {
        switch (pageFeature.name) {
          case 'keywords':
            keywords =
              pageFeature.value instanceof Array ? pageFeature.value : null;
            break;
          case 'topicModelFeatures':
            topicModel =
              !(pageFeature.value instanceof Array) &&
              pageFeature.value instanceof Object
                ? pageFeature.value
                : undefined;
            break;
          default:
            otherFeatures[pageFeature.name] = pageFeature.value;
        }
      }
    }

    if (topicModel) {
      return {
        ts,
        features: { topicModel, ...otherFeatures },
      };
    } else if (keywords) {
      return {
        ts,
        features: { keywords, ...otherFeatures },
      };
    } else {
      return undefined;
    }
  }

  insert(pageFeatures: PageFeature<T>[]) {
    const pageView = this._formatIntoPageView<T>(pageFeatures);
    if (!pageView) return;
    this.pageViews.push(pageView);
    this._save();
  }
}

export const viewStore = new ViewStore();
