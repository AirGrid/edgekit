const condition = {
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
        name: 'count' as const,
      },
      matcher: {
        name: 'gt' as const,
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
