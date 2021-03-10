import {
  AudienceDefinition,
  QueryFilterComparisonType,
  AudienceQueryDefinition,
  CosineSimilarityQueryValue,
  LogisticRegressionQueryValue,
} from '../../types';

const ID = 'testid';
const TTL_IN_SECS = 100;
const LOOK_BACK_IN_SECS = 100;
const OCCURRENCES = 2;
const VERSION = 1;

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

type PartialAudienceQueryDefinition = Partial<
  Pick<AudienceQueryDefinition, 'featureVersion' | 'queryProperty'>
>;

// cosineSimilarity audiences

export const makeCosineSimilarityQuery = ({
  queryValue,
  ...partialAudienceQueryDefinition
}: {
  queryValue: CosineSimilarityQueryValue;
} & PartialAudienceQueryDefinition): AudienceQueryDefinition => ({
  featureVersion: 1,
  queryFilterComparisonType: QueryFilterComparisonType.COSINE_SIMILARITY,
  queryProperty: 'topicDist',
  ...partialAudienceQueryDefinition,
  queryValue,
});

export const cosineSimAudience = makeAudienceDefinition({
  occurrences: 1,
  definition: [
    makeCosineSimilarityQuery({
      queryValue: {
        threshold: 0.99,
        vector: [1, 1, 1],
      },
    }),
  ],
});

export const multiCosineSimAudience = makeAudienceDefinition({
  occurrences: 1,
  definition: [
    makeCosineSimilarityQuery({
      queryValue: {
        threshold: 0.99,
        vector: [1, 1, 1],
      },
    }),
    makeCosineSimilarityQuery({
      queryValue: {
        threshold: 0.99,
        vector: [1, 0, 1],
      },
    }),
  ],
});

// logistic regression audiences

export const makeLogisticRegressionQuery = ({
  queryValue,
  ...partialAudienceQueryDefinition
}: {
  queryValue: LogisticRegressionQueryValue;
} & PartialAudienceQueryDefinition): AudienceQueryDefinition => ({
  featureVersion: 1,
  queryFilterComparisonType: QueryFilterComparisonType.LOGISTIC_REGRESSION,
  queryProperty: 'docVector',
  ...partialAudienceQueryDefinition,
  queryValue,
});

export const logRegAudience = makeAudienceDefinition({
  occurrences: 1,
  definition: [
    makeLogisticRegressionQuery({
      queryValue: {
        threshold: 0.9,
        vector: [1, 1, 1],
        bias: 0,
      },
    }),
  ],
});

export const multiLogRegAudience = makeAudienceDefinition({
  occurrences: 1,
  definition: [
    makeLogisticRegressionQuery({
      queryValue: {
        threshold: 0.9,
        vector: [1, 1, 1],
        bias: 0,
      },
    }),
    makeLogisticRegressionQuery({
      queryValue: {
        threshold: 0.9,
        vector: [1, 0, 1],
        bias: 1,
      },
    }),
  ],
});
