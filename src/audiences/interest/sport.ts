import { Condition } from 'types';

const condition: Condition = {
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
