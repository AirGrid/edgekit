export interface PageFeatureGetter {
  name: string;
  func: () => Promise<string[]>;
}

export interface MatchedAudience {
  id: string;
  matchedAt: number;
  expiresAt: number;
  matchedOnCurrentPageView: boolean;
}

export interface PageFeature {
  name: string;
  error: boolean;
  value: string[];
}

export enum StorageKeys {
  PAGE_VIEWS = 'edkt_page_views',
  MATCHED_AUDIENCES = 'edkt_matched_audiences',
  MATCHED_AUDIENCE_IDS = 'edkt_matched_audience_ids',
}

export interface PageView {
  ts: number;
  features: {
    [name: string]: string[];
  };
}

export interface ConditionQuery {
  property: string;
  value: string[];
}

export interface ConditionRule {
  reducer: {
    name: 'count';
    // args?: string;
  };
  matcher: {
    name: 'eq' | 'gt' | 'lt' | 'ge' | 'le';
    args: number;
  };
}

export interface Condition {
  filter: {
    // TODO: return support for any?
    any?: boolean;
    queries: ConditionQuery[];
  };
  rules: ConditionRule[];
}
