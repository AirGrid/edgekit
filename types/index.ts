// #############################
// Domain Model Interfaces
// #############################

// Page view interfaces

export type PageFeatureValue = string[] | number[];

export type PageFeatureResult = {
  version: number;
  value: PageFeatureValue;
};

// unused?
export interface PageFeatureGetter {
  name: string;
  func: () => Promise<PageFeatureResult>;
}

// unused?
export type PageFeature =
  | {
      name: string;
      error: true;
    }
  | {
      name: string;
      error: false;
      version: number;
      value: PageFeatureValue;
    };

export interface PageView {
  ts: number;
  target?: boolean;  // unused?
  keyHash?: string;  // unused?
  features: Record<string, PageFeatureResult>;
}

// Audience definition interfaces

export type StringArrayQueryValue = Extract<PageFeatureValue, string[]>;

export type VectorQueryValue = {
  vector: number[];
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
}

export type VectorDistanceFilter = {
  queryValue: VectorQueryValue;
  queryFilterComparisonType: QueryFilterComparisonType.VECTOR_DISTANCE;
}

export type CosineSimilarityFilter = {
  queryValue: VectorQueryValue;
  queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY;
}

export type AudienceDefinitionFilter =
  | VectorDistanceFilter
  | CosineSimilarityFilter
  | ArrayIntersectsFilter

export type AudienceQueryDefinition = {
  featureVersion: number;
  queryProperty: string;
} & AudienceDefinitionFilter;

export interface AudienceDefinition {
  id: string;
  version: number;
  name?: string;  // unused?
  cacheFor?: number;  // unused?
  ttl: number;
  lookBack: number;
  occurrences: number;
  definition: AudienceQueryDefinition[]
}

// #############################
// Domain Services Interfaces
// #############################

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

export type EngineConditionQuery<T extends AudienceDefinitionFilter> =
  Pick<AudienceQueryDefinition, 'featureVersion' | 'queryProperty'> & T

export interface EngineCondition<T extends AudienceDefinitionFilter> {
  filter: {
    any?: boolean;
    queries: EngineConditionQuery<T>[];
  };
  rules: EngineConditionRule[];
}

// #############################
// Application Services Interfaces
// #############################

// Audience cache interfaces

export interface MatchedAudience {
  id: string;
  matchedAt: number;
  expiresAt: number;
  matchedOnCurrentPageView: boolean;
}

// unused?
export type AudienceState = 'live' | 'paused' | 'deleted';

export interface CachedAudienceMetaData {
  cachedAt: number;
  audiences: AudienceMetaData[];
}

export interface AudienceMetaData {
  id: string;
  version: number;
}

// #############################
// Infrastructure Interfaces
// #############################

// Storage interfaces

export enum StorageKeys {
  PAGE_VIEWS = 'edkt_page_views',
  MATCHED_AUDIENCES = 'edkt_matched_audiences',
  MATCHED_AUDIENCE_IDS = 'edkt_matched_audience_ids',
  CACHED_AUDIENCES = 'edkt_cached_audiences',
  CACHED_AUDIENCE_META_DATA = 'edkt_cached_audience_meta_data',
}

// Network interfaces

export interface PingResponse {
  gdprApplies?: boolean;
}

export interface TCData {
  gdprApplies?: boolean;

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

// #############################
// UI Interfaces
// #############################

// Top level API interfaces

export interface Edkt {
  run: () => Promise<void>;
}
