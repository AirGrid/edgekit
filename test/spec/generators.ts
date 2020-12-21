import * as fc from 'fast-check';
import {
  PageView,
  QueryFilterComparisonType,
  AudienceDefinitionFilter,
  EngineConditionQuery,
  VectorQueryValue,
  StringArrayQueryValue,
  EngineCondition,
  PageFeatureValue,
  CosineSimilarityFilter,
  VectorDistanceFilter,
} from '../../types';

// NumberArray
export const numberArrayGen = fc.array(fc.float(), 128, 128);

// Constant vectorQueryValue
export const constantVectorQueryValueGen = ({
  vector,
  threshold
}: VectorQueryValue) => fc.record({
  vector: fc.constant(vector),
  threshold: fc.constant(threshold),
}) as fc.Arbitrary<VectorQueryValue>;

// Constant AudienceQueryDefinition
export const constantVectorAudienceDefinitionFilterGen = (
  {
    vector,
    threshold,
  }: VectorQueryValue,
  queryFilterComparisonType: QueryFilterComparisonType,
) => fc.record({
  queryValue: constantVectorQueryValueGen({
    vector,
    threshold,
  }),
  queryFilterComparisonType: fc.constant(queryFilterComparisonType)
}) as fc.Arbitrary<CosineSimilarityFilter | VectorDistanceFilter>

// StringArrayQueryValue
export const stringArrayQueryValueGen =
  fc.array(fc.string()) as fc.Arbitrary<StringArrayQueryValue>;

// VectorQueryValue
export const vectorQueryValueGen = fc.record({
  vector: numberArrayGen,
  threshold: fc.float()
}) as fc.Arbitrary<VectorQueryValue>;

// PageView
export const pageViewGen = (
  value: fc.Arbitrary<PageFeatureValue>
) => fc.record({
  ts: fc.integer(),
  features: fc.record({
    topicDist: fc.record({
      version: fc.integer(),
      value,
    })
  })
}) as fc.Arbitrary<PageView>;

export const arrayIntersectsFilterGen = fc.record({
  queryValue: stringArrayQueryValueGen,
  queryFilterComparisonType:
    fc.constant(QueryFilterComparisonType.ARRAY_INTERSECTS),
}) as fc.Arbitrary<AudienceDefinitionFilter>;

export const vectorDistanceFilterGen = {
  queryValue: vectorQueryValueGen,
  queryFilterComparisonType:
    fc.constant(QueryFilterComparisonType.VECTOR_DISTANCE),
};

export const cosineSimilarityFilterGen = {
  queryValue: vectorQueryValueGen,
  queryFilterComparisonType:
    fc.constant(QueryFilterComparisonType.COSINE_SIMILARITY),
};

// AudienceQueryDefinition
export const audienceQueryDefinitionGen = (
  audienceDefinitionFilter: {
    queryValue: fc.Arbitrary<VectorQueryValue>,
    queryFilterComparisonType: fc.Arbitrary<QueryFilterComparisonType>
  }
) => fc.record({
  featureVersion: fc.integer(),
  queryProperty: fc.constant('topicDist'),
  ...audienceDefinitionFilter
}) as fc.Arbitrary<EngineConditionQuery<AudienceDefinitionFilter>>;

// EngineCondition<AudienceDefinitionFilter>
export const engineConditionGen = (
  audienceQueryDefinitionGen: fc.Arbitrary<EngineConditionQuery<AudienceDefinitionFilter>[]>
) => fc.record({
  filter: fc.record({
    any: fc.boolean(),
    queries: audienceQueryDefinitionGen,
  }),
  rules: fc.array(
    fc.record({
      reducer: fc.record({
        name: fc.constant('count')
      }),
      matcher: fc.record({
        name: fc.constant('ge'),
        args: fc.constant(1),
      })
    })
  )
}) as fc.Arbitrary<EngineCondition<AudienceDefinitionFilter>>;

// EngineCondition<CosineSimilarityFilter>
export const cosineSimilarityConditionGen =
  engineConditionGen(
    fc.array(audienceQueryDefinitionGen(
      cosineSimilarityFilterGen
    ))
) as fc.Arbitrary<EngineCondition<CosineSimilarityFilter>>;

// EngineCondition<VectorDistanceFilter>
export const vectorDistanceConditionGen =
  engineConditionGen(
    fc.array(audienceQueryDefinitionGen(
      vectorDistanceFilterGen
    ))
) as fc.Arbitrary<EngineCondition<VectorDistanceFilter>>;


export const constantVectorQueryValueEngineConditionGen = (
  vectorQueryValue: VectorQueryValue
) =>
  engineConditionGen(
    fc.array(audienceQueryDefinitionGen({
        queryValue: constantVectorQueryValueGen(vectorQueryValue),
        queryFilterComparisonType: fc.oneof(
          fc.constant(QueryFilterComparisonType.VECTOR_DISTANCE),
          fc.constant(QueryFilterComparisonType.COSINE_SIMILARITY),
        )}
    ))
) as fc.Arbitrary<EngineCondition<AudienceDefinitionFilter>>;
