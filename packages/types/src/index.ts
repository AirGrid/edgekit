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
    // any: boolean;
    queries: IConditionQuery[];
  };
  rules: IConditionRule[];
}
