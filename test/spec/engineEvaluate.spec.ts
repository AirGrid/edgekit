import * as fc from 'fast-check';
import {
  evaluateCondition,
} from '../../src/engine/evaluate';
import {
  numberArrayGen,
  pageViewGen,
  cosineSimilarityConditionGen,
  vectorDistanceConditionGen,
  constantVectorQueryValueEngineConditionGen,
} from './generators';
import {
  EngineCondition,
  AudienceDefinitionFilter,
  CosineSimilarityFilter,
  VectorDistanceFilter,
  PageView,
} from '../../types';

fc.configureGlobal({
  seed: 33,
  numRuns: 1000,
})

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
            threshold: 0.99,
          }

          // then we can generate arbitrary engine conditions
          // matching the pageView
          return fc.record({
            condition: constantVectorQueryValueEngineConditionGen(vectorQueryValue),
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

    it('does not matches if input data similarity is below threshold', () => {
      fc.assert(fc.property(
        // Matching (audience, pageView) pair generator
        pageViewGen(numberArrayGen).chain(pageView => {

          // having the paveView vector value,
          // here we would transform it
          // so it will always mismatch
          const vectorQueryValue = {
            // TODO improve rotation operation
            vector: (pageView.features.topicDist.value as number[]).map(v => Math.log(v)),
            threshold: 0.99,
          }

          // then we can generate arbitrary engine conditions
          // matching the pageView
          return fc.record({
            condition: constantVectorQueryValueEngineConditionGen(vectorQueryValue),
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

          // given mismatching vector values,
          // it should always return false
          expect(result).toBe(false)
        }
      ))
    })
  });
});
