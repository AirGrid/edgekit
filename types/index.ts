// Page view interfaces

export type PageFeatureResult = {
  version: number;
  value: number[];
};

export interface PageView {
  ts: number;
  features: Record<string, PageFeatureResult>;
}

// Audience definition interfaces

export type CosineSimilarityQueryValue = {
  vector: PageFeatureResult['value'];
  threshold: number;
};

export type LogisticRegressionQueryValue = {
  vector: PageFeatureResult['value'];
  bias: number;
  threshold: number;
};

export enum QueryFilterComparisonType {
  COSINE_SIMILARITY = 'cosineSimilarity',
  LOGISTIC_REGRESSION = 'logisticRegression',
}

export type CosineSimilarityFilter = {
  queryValue: CosineSimilarityQueryValue;
  queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY;
};

export type LogisticRegressionFilter = {
  queryValue: LogisticRegressionQueryValue;
  queryFilterComparisonType: QueryFilterComparisonType.LOGISTIC_REGRESSION;
};

export type AudienceDefinitionFilter =
  | CosineSimilarityFilter
  | LogisticRegressionFilter;

export type AudienceQueryDefinition = {
  featureVersion: number;
  queryProperty: string;
} & AudienceDefinitionFilter;

export interface AudienceDefinition {
  id: string;
  version: number;
  ttl: number;
  lookBack: number;
  occurrences: number;
  definition: AudienceQueryDefinition[];
}

// Engine internal interfaces

export interface EngineConditionRule {
  reducer: {
    name: 'count';
  };
  matcher: {
    name: 'eq' | 'gt' | 'lt' | 'ge' | 'le';
    args: number;
  };
}

export type EngineConditionQuery<T extends AudienceDefinitionFilter> = Pick<
  AudienceQueryDefinition,
  'featureVersion' | 'queryProperty'
> &
  T;

export interface EngineCondition<T extends AudienceDefinitionFilter> {
  filter: {
    any?: boolean;
    queries: EngineConditionQuery<T>[];
  };
  rules: EngineConditionRule[];
}

// Audience cache interfaces

export interface MatchedAudience {
  id: string;
  version: number;
  matchedAt: number;
  expiresAt: number;
  matchedOnCurrentPageView: boolean;
}

export interface CachedAudienceMetaData {
  cachedAt: number;
  audiences: AudienceMetaData[];
}

export interface AudienceMetaData {
  id: string;
  version: number;
}

// Storage interfaces

export enum StorageKeys {
  PAGE_VIEWS = 'edkt_page_views',
  MATCHED_AUDIENCES = 'edkt_matched_audiences',
  MATCHED_AUDIENCE_IDS = 'edkt_matched_audience_ids',
  CACHED_AUDIENCES = 'edkt_cached_audiences',
  CACHED_AUDIENCE_META_DATA = 'edkt_cached_audience_meta_data',
}

// Gdpr consent interfaces

// https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#tcdata
export interface TCData {
  gdprApplies: boolean;

  eventStatus: 'tcloaded' | 'cmpuishown' | 'useractioncomplete';

  cmpStatus: 'stub' | 'loading' | 'loaded' | 'error';

  /**
   * If this TCData is sent to the callback of addEventListener: number,
   * the unique ID assigned by the CMP to the listener function registered
   * via addEventListener.
   * Others: undefined.
   */
  listenerId?: number | undefined;

  vendor: {
    consents: { [vendorId: number]: boolean | undefined };
  };
}

export interface ConsentStatus {
  eventStatus: 'tcloaded' | 'useractioncomplete' | 'cmpuishown';
  hasConsent: boolean;
}

declare global {
  interface Window {
    __tcfapi(
      command: 'addEventListener',
      version: number,
      cb: (tcData: TCData, success: boolean) => void
    ): void;

    __tcfapi(
      command: 'removeEventListener',
      version: number,
      cb: (success: boolean) => void,
      listenerId: number
    ): void;
  }
}

// Top level API interfaces

interface Config {
  audienceDefinitions: AudienceDefinition[];
  pageFeatures?: Record<string, PageFeatureResult>;
  pageMetadata?: Record<string, string | number | boolean>;
  vendorIds?: number[];
  omitGdprConsent?: boolean;
  featureStorageSize?: number;
}

export interface Edkt {
  run: (config: Config) => Promise<void>;
  getMatchedAudiences: () => MatchedAudience[];
  getCopyOfPageViews: () => PageView[];
}
