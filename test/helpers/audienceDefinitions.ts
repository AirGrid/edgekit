import {
  AudienceDefinition,
  QueryFilterComparisonType,
  AudienceQueryDefinition,
  VectorQueryValue,
  LogisticRegressionQueryValue,
  StringArrayQueryValue,
} from '../../types';

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

export const makeAudienceDefinition = (
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

// stringArray audiences

export const makeStringArrayQuery = (
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

export const allAudienceDefinitions = [
  sportInterestAudience,
  travelInterestAudience,
  automotiveInterestAudience,
];

// vectorDistance audiences

export const makeVectorDistanceQuery = (
  queryValue: VectorQueryValue,
  featureVersion = 1
): AudienceQueryDefinition => ({
  featureVersion,
  queryFilterComparisonType: QueryFilterComparisonType.VECTOR_DISTANCE,
  queryProperty: 'topicDist',
  queryValue,
});

// cosineSimilarity audiences

export const makeCosineSimilarityQuery = (
  queryValue: VectorQueryValue,
  featureVersion = 1
): AudienceQueryDefinition => ({
  featureVersion,
  queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
  queryProperty: 'topicDist',
  queryValue,
});

export const cosineSimAudience = makeAudienceDefinition({
  occurrences: 1,
  definition: [
    makeCosineSimilarityQuery({
      threshold: 0.99,
      vector: [1, 1, 1],
    }),
  ],
});

export const multiCosineSimAudience = makeAudienceDefinition({
  occurrences: 1,
  definition: [
    makeCosineSimilarityQuery({
      threshold: 0.99,
      vector: [1, 1, 1],
    }),
    makeCosineSimilarityQuery({
      threshold: 0.99,
      vector: [1, 0, 1],
    }),
  ],
});

// logistic regression audiences

export const makeLogisticRegressionQuery = (
  queryValue: LogisticRegressionQueryValue,
  featureVersion = 1
): AudienceQueryDefinition => ({
  featureVersion,
  queryFilterComparisonType: QueryFilterComparisonType.LOGISTIC_REGRESSION,
  queryProperty: 'docVector',
  queryValue,
});

export const logRegAudience = makeAudienceDefinition({
  occurrences: 1,
  definition: [
    makeLogisticRegressionQuery({
      threshold: 0.9,
      vector: [1, 1, 1],
      bias: 0,
    }),
  ],
});

export const multiLogRegAudience = makeAudienceDefinition({
  occurrences: 1,
  definition: [
    makeLogisticRegressionQuery({
      threshold: 0.9,
      vector: [1, 1, 1],
      bias: 0,
    }),
    makeLogisticRegressionQuery({
      threshold: 0.9,
      vector: [1, 0, 1],
      bias: 1,
    }),
  ],
});
