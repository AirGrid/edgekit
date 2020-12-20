import * as fc from 'fast-check';
import {
  evaluateCondition,
} from '../../src/engine/evaluate';
import {
  numberArrayGen,
  pageViewGen,
  engineConditionGen,
  audienceQueryDefinitionGen,
  cosineSimilarityConditionGen,
  vectorDistanceConditionGen,
  constantVectorQueryValueGen,
} from './generators';
import {
  EngineCondition,
  AudienceDefinitionFilter,
  CosineSimilarityFilter,
  VectorDistanceFilter,
  PageView,
  QueryFilterComparisonType,
} from '../../types';

describe('Engine evaluate methods over VectorQueryValue', () => {
  describe('Engine evaluateCondition method behaviour', () => {
    it('always produces valid output', () => {
      fc.assert(fc.property(
        fc.oneof(cosineSimilarityConditionGen, vectorDistanceConditionGen),
        fc.array(pageViewGen(numberArrayGen)),
        ( condition, pageViews ) => {
          const result = evaluateCondition(
            condition as EngineCondition<AudienceDefinitionFilter>,
            pageViews as PageView[],
          )
          expect(result).toBeDefined()
          // should always returns a boolean value and not throw errors
          expect(typeof result).toBe('boolean')
          // if there is no pageViews, don't match at all
          if (pageViews.length === 0) {
            expect(result).toBe(false)
          }
          // if there is no query, don't match at all
          if (condition.filter.queries.length === 0) {
            expect(result).toBe(false)
          }
        }
      ))
    })

    it('matches if input data similarity is above threshold', () => {
      fc.assert(fc.property(
        // Matching (audience, pageView) pair generator
        pageViewGen(numberArrayGen).chain(pageView => {

          // let's generate vectorQueryValues matching
          // the feature value from the current pageView
          const vectorQueryValue = {
            vector: pageView.features.topicDist.value as number[], // should this be necessary?
            threshold: 0.98,
          }

          // then we can generate arbitrary engine conditions
          // matching the pageView
          return fc.record({
            condition: engineConditionGen(
              fc.array(audienceQueryDefinitionGen(
                fc.record({
                  queryValue: constantVectorQueryValueGen(vectorQueryValue),
                  queryFilterComparisonType: fc.oneof(
                    fc.constant(QueryFilterComparisonType.VECTOR_DISTANCE),
                    fc.constant(QueryFilterComparisonType.COSINE_SIMILARITY),
                  )
                }) as fc.Arbitrary<AudienceDefinitionFilter>
              ))
            ) as fc.Arbitrary<EngineCondition<AudienceDefinitionFilter>>,
            pageViews: fc.array(fc.constant(pageView))
          })

        }).filter(({condition, pageViews}) =>
          // lets keep the ones containing
          // some data and discard the rest
          condition.filter.queries.length > 0 &&
          condition.rules.length > 0 &&
          pageViews.length > 0
        ),

        // assertions
        ( {condition, pageViews} ) => {

          // evaluate for generated inputs
          const result = evaluateCondition(
            condition as EngineCondition<CosineSimilarityFilter | VectorDistanceFilter>,
            pageViews as PageView[],
          )

          // given identical vector values,
          // if versions are equals, then match
          if (pageViews.some(
            pageView => condition.filter.queries.some(
              query => query.featureVersion === pageView.features.topicDist.version)
          )) {
            expect(result).toBe(true)
          } else {
            expect(result).toBe(false)
          }
        }
      ))
    });

  });
});
