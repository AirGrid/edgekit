// Page view interfaces

export type PageFeatureValue = string[] | number[];

export type PageFeatureResult = {
  version: number;
  value: PageFeatureValue;
};

export interface PageView {
  ts: number;
  features: Record<string, PageFeatureResult>;
}

// Audience definition interfaces

export type StringArrayQueryValue = Extract<PageFeatureValue, string[]>;

export type VectorQueryValue = {
  vector: Extract<PageFeatureValue, number[]>;
  threshold: number;
};

export enum QueryFilterComparisonType {
  VECTOR_DISTANCE = 'vectorDistance',
  COSINE_SIMILARITY = 'cosineSimilarity',
  ARRAY_INTERSECTS = 'arrayIntersects',
}

export type ArrayIntersectsFilter = {
  queryValue: StringArrayQueryValue;
  queryFilterComparisonType: QueryFilterComparisonType.ARRAY_INTERSECTS;
};

export type VectorDistanceFilter = {
  queryValue: VectorQueryValue;
  queryFilterComparisonType: QueryFilterComparisonType.VECTOR_DISTANCE;
};

export type CosineSimilarityFilter = {
  queryValue: VectorQueryValue;
  queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY;
};

export type AudienceDefinitionFilter =
  | VectorDistanceFilter
  | CosineSimilarityFilter
  | ArrayIntersectsFilter;

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
