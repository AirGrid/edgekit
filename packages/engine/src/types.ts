export interface IPageView {
  features: {
    keywords: string[];
  };
}

interface IConditionQuery {
  property: string;
  value?: any;
}

interface IConditionRule {
  reducer?: {
    name: string;
    args?: any;
  };
  matcher?: {
    name: string;
    args: any;
  };
}

export interface ICondition {
  filter: {
    any: boolean;
    queries: IConditionQuery[];
  };
  rules: IConditionRule[];
}
