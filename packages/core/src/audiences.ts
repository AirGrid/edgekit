const condition1 = {
  filter: {
    queries: [
      {
        property: 'keywords',
        value: ['sport'],
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
    }
  ],
};

export const travelAudience = {
  id: 'travel1',
  conditions: [condition1]
}