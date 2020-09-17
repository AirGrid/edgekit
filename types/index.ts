export interface Edkt {
  run: () => Promise<void>;
}

// Storage Keys Enum

export enum StorageKeys {
  PAGE_VIEWS = 'edkt_page_views',
  MATCHED_AUDIENCES = 'edkt_matched_audiences',
  MATCHED_AUDIENCE_IDS = 'edkt_matched_audience_ids',
  CACHED_AUDIENCES = 'edkt_cached_audiences',
  CACHED_AUDIENCE_META_DATA = 'edkt_cached_audience_meta_data',
}

// Page Features

export interface TopicModelFeature {
  version: number;
  vector: number[];
}

export type PageFeatureValue<T> = string[] | TopicModelFeature | T;

export interface PageFeatureGetter<T> {
  name: string;
  func: () => Promise<PageFeatureValue<T>>;
}

export type PageFeatureKeyword = {
  name: 'keyword';
  error: boolean;
  value: string[];
};

export type PageFeatureTopicModel = {
  name: 'topicModelFeatures';
  error: boolean;
  value: TopicModelFeature;
};

export type PageFeatureCustom<T> = {
  name: string;
  error: boolean;
  value: string[] | TopicModelFeature | T;
};

export type PageFeature<T> =
  | PageFeatureKeyword
  | PageFeatureTopicModel
  | PageFeatureCustom<T>;

export interface PageView<T> {
  ts: number;
  features: {
    keywords?: string[];
    topicModel?: TopicModelFeature;
  } & Record<string, PageFeatureValue<T>>;
}

// Audiences

export interface MatchedAudience {
  id: string;
  matchedAt: number;
  expiresAt: number;
  matchedOnCurrentPageView: boolean;
}

export interface VectorCondition {
  occurrences: number;
  threshold: number;
}

export interface AudienceDefinition {
  id: string;
  name: string;
  ttl: number;
  lookBack: number;
  occurrences: number;
  version: number;
  keywords?: string[];
  topicModel?: {
    vector: number[];
    threshold: number;
  };
}

export interface CachedAudienceMetaData {
  cachedAt: number;
  audiences: AudienceMetaData[];
}

export interface AudienceMetaData {
  id: string;
  version: number;
}

// Engine

export type EngineConditionQuery =
  | {
      property: 'keywords';
      value: string[];
    }
  | {
      property: 'topicModel';
      value: {
        vector: number[];
        threshold: number;
      };
    };

export interface EngineConditionRule {
  reducer: {
    name: 'count';
  };
  matcher: {
    name: 'eq' | 'gt' | 'lt' | 'ge' | 'le';
    args: number;
  };
}

export interface EngineCondition {
  filter: {
    any?: boolean;
    queries: EngineConditionQuery[];
  };
  rules: EngineConditionRule[];
}

export interface PingResponse {
  gdprApplies?: boolean;
}

export interface TCData {
  gdprApplies?: boolean;
  vendor: {
    consents: { [vendorId: number]: boolean | undefined };
  };
}

declare global {
  interface Window {
    __tcfapi(
      command: 'ping',
      version: number,
      cb: (response: PingResponse) => void
    ): void;

    __tcfapi(
      command: 'getTCData',
      version: number,
      cb: (tcData: TCData, success: boolean) => void
    ): void;
  }
}
