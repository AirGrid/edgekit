import {
  storage,
  timeStampInSecs,
  isStringArray,
  isNumberArray,
} from '../utils';
import {
  PageView,
  StorageKeys,
  PageFeature,
  PageFeatureValue,
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
    let topicDist: number[] | null = null;
    const otherFeatures: Record<string, PageFeatureValue<T>> = {};

    for (const pageFeature of pageFeatures) {
      if (!pageFeature.error) {
        switch (pageFeature.name) {
          case 'keywords':
            keywords = isStringArray(pageFeature.value)
              ? pageFeature.value
              : null;
            break;
          case 'topicDist':
            topicDist = isNumberArray(pageFeature.value)
              ? pageFeature.value
              : null;
            break;
          default:
            otherFeatures[pageFeature.name] = pageFeature.value;
        }
      }
    }

    if (keywords || topicDist) {
      return {
        ts,
        features: {
          ...(keywords && { keywords }),
          ...(topicDist && { topicDist }),
          ...otherFeatures,
        },
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
