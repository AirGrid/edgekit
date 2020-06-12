// TODO: this is being duplicated - types should be shared.
export interface IPageView {
  ts: number;
  features: {
    // keywords: string[];
    [name: string]: string[];
  };
}

interface IConditionQuery {
  property: string;
  value?: any;
}

interface IConditionRule {
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
