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
        name: 'count' as 'count',
      },
      matcher: {
        name: 'gt' as 'gt',
        args: 1,
      },
    }
  ],
};

export default {    
  id: 'sport',
  ttl: 3600,
  conditions: [condition]
};
