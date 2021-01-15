import {
  AudienceDefinition,
  QueryFilterComparisonType,
  AudienceQueryDefinition,
  VectorQueryValue,
  StringArrayQueryValue,
} from '../../types';

// stringArray audiences

const ID = 'testid';
const TTL_IN_SECS = 100;
const LOOK_BACK_IN_SECS = 100;
const OCCURRENCES = 2;
const VERSION = 1;

export const sportKeywords = ['golf', 'liverpool', 'football', 'sport'];

export const travelKeywords = [
  'british airways',
  'cruise ship',
  'ship',
  'airline',
  'hotel',
  'travel',
  'holland america line',
  'royal navy',
  'tourism',
  'cruise line',
];

export const automotiveKeywords = [
  'international space station',
  'vehicle',
  'road',
  'driving',
  'elon musk',
  'walking',
  'traffic',
  'transport',
];

const makeAudienceDefinition = (
  partialAudienceDefinition: Partial<AudienceDefinition>
): AudienceDefinition => ({
  id: ID,
  version: VERSION,
  ttl: TTL_IN_SECS,
  lookBack: LOOK_BACK_IN_SECS,
  occurrences: OCCURRENCES,
  definition: [],
  ...partialAudienceDefinition,
});

const makeStringArrayQuery = (
  queryValue: StringArrayQueryValue
): AudienceQueryDefinition => ({
  featureVersion: 1,
  queryProperty: 'keywords',
  queryFilterComparisonType: QueryFilterComparisonType.ARRAY_INTERSECTS,
  queryValue,
});

export const sportInterestAudience = makeAudienceDefinition({
  id: 'iab-607',
  definition: [makeStringArrayQuery(sportKeywords)],
});

export const travelInterestAudience = makeAudienceDefinition({
  id: 'iab-719',
  definition: [makeStringArrayQuery(travelKeywords)],
});

export const automotiveInterestAudience = makeAudienceDefinition({
  id: 'iab-243',
  definition: [makeStringArrayQuery(automotiveKeywords)],
});

// vectorDistance audiences

// cosineSimilarity audiences

const makeCosineSimQuery = (
  queryValue: VectorQueryValue
): AudienceQueryDefinition => ({
  featureVersion: 1,
  queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
  queryProperty: 'dv',
  queryValue,
});

export const cosineSimAudience = makeAudienceDefinition({
  occurrences: 1,
  definition: [
    makeCosineSimQuery({
      threshold: 0.8,
      vector: [1, 1, 1],
    }),
  ],
});

export const multiCosineSimAudience = makeAudienceDefinition({
  occurrences: 1,
  definition: [
    makeCosineSimQuery({
      threshold: 0.99,
      vector: [1, 1, 1],
    }),
    makeCosineSimQuery({
      threshold: 0.99,
      vector: [1, 0, 1],
    }),
  ],
});

// all audiences export

export const allAudienceDefinitions = [
  sportInterestAudience,
  travelInterestAudience,
  automotiveInterestAudience,
];
