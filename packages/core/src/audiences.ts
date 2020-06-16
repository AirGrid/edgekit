const travelCond = {
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

const sportCond = {
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

export const audiences = [
  {
    id: 'travel',
    ttl: 3600,
    conditions: [travelCond]
  },
  {    
    id: 'sport',
    ttl: 3600,
    conditions: [sportCond]
  }
];
