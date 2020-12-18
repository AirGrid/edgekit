import * as fc from 'fast-check';
import { evaluateCondition } from '../../src/engine/evaluate';
import {
  EngineCondition,
  QueryFilterComparisonType,
  CosineSimilarityFilter,
  PageView,
} from '../../types';

// Implementation of the generators mimicking
// the type definitions

// NumberArray
const vectorGen = fc.array(fc.float(), 128, 128)

// VectorQueryValue
const queryValueGen = fc.record({
  vector: vectorGen,
  threshold: fc.float()
})

// AudienceQueryDefinition
const queryArrayGen = fc.array(
  fc.record({
    featureVersion: fc.integer(),
    queryProperty: fc.constant('topicDist'),
    queryFilterComparisonType:
      fc.constant(QueryFilterComparisonType.COSINE_SIMILARITY),
    queryValue: queryValueGen
  })
)

// EngineCondition<AudienceDefinitionFilter>
const cosineSimilarityConditionGen  =
  fc.record({
  filter: fc.record({
    any: fc.boolean(),
    queries: queryArrayGen,
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
})

// PageView[]
const pageViewsGen = fc.array(
  fc.record({
    ts: fc.integer(),
    features: fc.record({
      topicDist: fc.record({
        version: fc.integer(),
        value: vectorGen,
      })
    })
  })
)

describe('Engine evaluateCondition method behaviour', () => {
  fc.assert(
    fc.property(
      cosineSimilarityConditionGen,
      pageViewsGen,
      (
        condition,
        pageViews,
      ) => {

        const result = evaluateCondition(
          condition as EngineCondition<CosineSimilarityFilter>,
          pageViews as PageView[]
        )

        // should always returns a boolean value and not throw errors
        expect(typeof result).toBe('boolean')

        // the below should pass, but in the actual implementation
        // using rules.every, whenever the rule
        // array is empty, the evaluateCondition
        // will return true
        //
        // this is a good case for demonstrating the
        // runner's shrinking capabilities anyways.

        // if there is no pageViews to match, don't match at all
        if (pageViews.length === 0) {
          expect(result).toBe(false)
        }

        // if there is no queries, don't match at all
        if (condition.filter.queries.length === 0) {
          expect(result).toBe(false)
        }

        // TODO specify remaining desired behaviours
      })
  );
});
