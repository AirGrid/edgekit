import 'jest';
import { check } from '../src';

const sports1xCondition = {
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
      { features: { keywords: ['sport', 'football'] } },
      { features: { keywords: ['sport', 'football'] } },
    ];

    const result = check(conditions, pageViews);

    expect(result).toEqual([true]);
  });
});
