import 'jest';
import { ICondition } from 'types';
import { check } from '../src/engine';

const sports1xCondition: ICondition = {
  filter: {
    any: false,
    queries: [{ property: 'keywords', value: ['sport'] }],
  },
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: 'gt',
        args: 1,
      },
    },
  ],
};

describe('Engine test', () => {
  it('evaluates first model', async () => {
    const conditions = [sports1xCondition];

    const pageViews = [
      { ts: 100, features: { keywords: ['sport', 'football'] } },
      { ts: 101, features: { keywords: ['sport', 'football'] } },
    ];

    const result = check(conditions, pageViews);

    expect(result).toEqual(true);
  });
});
