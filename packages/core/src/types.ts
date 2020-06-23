export interface IPageFeatureGetter {
  name: string;
  func: () => Promise<string[]>;
}

export enum StorageKeys {
  PAGE_VIEWS = 'edkt_page_views',
  MATCHED_AUDIENCES = 'edkt_matched_audiences',
  MATCHED_AUDIENCE_IDS = 'edkt_matched_audience_ids',
}
