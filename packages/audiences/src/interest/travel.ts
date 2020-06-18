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
        name: 'count' as 'count',
      },
      matcher: {
        name: 'gt' as 'gt',
        args: 2,
      },
    }
  ],
};

export default {
  id: 'travel',
  ttl: 3600,
  conditions: [condition]
};
