const condition = {
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
        name: 'count' as const,
      },
      matcher: {
        name: 'gt' as const,
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
