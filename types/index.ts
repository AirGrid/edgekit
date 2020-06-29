export interface IPageFeatureGetter {
  name: string;
  func: () => Promise<string[]>;
}

export interface IMatchedAudience {
  id: string;
  matchedAt: number;
  expiresAt: number;
  matchedOnCurrentPageView: boolean;
}

export interface IPageFeature {
  name: string;
  error: boolean;
  value: string[];
}

export enum StorageKeys {
  PAGE_VIEWS = 'edkt_page_views',
  MATCHED_AUDIENCES = 'edkt_matched_audiences',
  MATCHED_AUDIENCE_IDS = 'edkt_matched_audience_ids',
}

export interface IPageView {
  ts: number;
  features: {
    [name: string]: string[];
  };
}

export interface IConditionQuery {
  property: string;
  value: string[];
}

export interface IConditionRule {
  reducer: {
    name: 'count';
    // args?: string;
  };
  matcher: {
    name: 'eq' | 'gt' | 'lt' | 'ge' | 'le';
    args: number;
  };
}

export interface ICondition {
  filter: {
    // TODO: return support for any?
    any?: boolean;
    queries: IConditionQuery[];
  };
  rules: IConditionRule[];
}
