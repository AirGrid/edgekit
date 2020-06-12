export interface IPageView {
  ts: number;
  features: {
    [name: string]: string[];
  };
}