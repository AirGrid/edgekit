import condition from '../src/condition';

// Condition 1 is true if we have
// * exactly 2 records with category = sport and
// * these records have a dwell time of 3
export const condition1 = condition({
  // This will filter out log entries for processing
  filter: {
    any: true,
    queries: [
      {
        property: 'category',
        value: 'sport',
      },
    ],
  },
  // All rules have to match *inside a condition*
  // (but not all conditions have to match in a model)
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: 'eq',
        args: 2,
      },
    },
    {
      reducer: {
        name: 'sum',
        args: 'dwell',
      },
      matcher: {
        name: 'eq',
        args: 3,
      },
    },
  ],
});

export const sport2xCondition = condition({
  filter: {
    any: true,
    queries: [
      {
        property: 'category',
        value: 'sport',
      },
    ],
  },
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: 'eq',
        args: 2,
      },
    },
  ],
});

export const golf1xCondition = condition({
  filter: {
    any: true,
    queries: [
      {
        property: 'keyword',
        value: 'golf',
      },
    ],
  },
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: 'eq',
        args: 1,
      },
    },
  ],
});

export const catOrDogCondition = condition({
  filter: {
    any: true,
    queries: [
      {
        property: 'keyword',
        value: 'cat',
      },
      {
        property: 'keyword',
        value: 'dog',
      },
    ],
  },
  rules: [
    {
      reducer: {
        name: 'count',
      },
      matcher: {
        name: 'eq',
        args: 2,
      },
    },
  ],
});
