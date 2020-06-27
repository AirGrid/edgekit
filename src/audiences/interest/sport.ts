import { ICondition } from 'types';

const condition: ICondition = {
  filter: {
    queries: [
      {
        property: 'keywords',
        value: ['sport', 'football'],
      },
    ],
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

export default {
  id: 'sport',
  ttl: 3600,
  conditions: [condition],
};
