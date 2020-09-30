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

export type PageFeatureValue = string[] | number[];

export type PageFeatureResult = {
  version: number;
  value: PageFeatureValue;
};

export interface PageFeatureGetter {
  name: string;
  func: () => Promise<PageFeatureResult>;
}

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
  features: Record<string, PageFeatureResult>;
}

// Audiences

export interface MatchedAudience {
  id: string;
  matchedAt: number;
  expiresAt: number;
  matchedOnCurrentPageView: boolean;
}

export type StringArrayQueryValue = string[];
export type VectorQueryValue = {
  vector: number[];
  threshold: number;
};

export interface AudienceDefinition {
  id: string;
  version: number;
  name: string;
  definition:
    | {
        ttl: number;
        lookBack: number;
        occurrences: number;
        queryProperty: string;
        queryValue: VectorQueryValue;
        queryFilterComparisonType: 'vectorDistance';
      }
    | {
        ttl: number;
        lookBack: number;
        occurrences: number;
        queryProperty: string;
        queryValue: StringArrayQueryValue;
        queryFilterComparisonType: 'arrayIntersects';
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
      version: number;
      property: string;
      filterComparisonType: 'arrayIntersects';
      value: StringArrayQueryValue;
    }
  | {
      version: number;
      property: string;
      filterComparisonType: 'vectorDistance';
      value: VectorQueryValue;
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
