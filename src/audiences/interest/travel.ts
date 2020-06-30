import { Condition } from 'types';

const condition: Condition = {
  filter: {
    queries: [
      {
        property: 'keywords',
        value: ['beach', 'holiday'],
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
        args: 2,
      },
    },
  ],
};

export default {
  id: 'travel',
  ttl: 3600,
  conditions: [condition],
};
