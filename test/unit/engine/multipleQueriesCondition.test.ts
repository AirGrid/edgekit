import { evaluateCondition } from '../../../src/engine';
import {
  makeEngineCondition,
  makePageView,
} from '../../helpers/engineConditions';
import { makeCosineSimilarityQuery } from '../../helpers/audienceDefinitions';

describe('engine matching behaviour for multiple engine condition values', () => {
  const VECTOR_ONE = [0, 1, 0];
  const VECTOR_TWO = [1, 0, 0];
  const NOT_MATCHING_VECTOR = [0, 0, 1];

  const multipleNonOverlapingQueriesCondition = makeEngineCondition({
    queries: [
      makeCosineSimilarityQuery({
        queryValue: {
          vector: VECTOR_ONE,
          threshold: 0.99,
        },
        featureVersion: 1,
      }),
      makeCosineSimilarityQuery({
        queryValue: {
          vector: VECTOR_TWO,
          threshold: 0.99,
        },
        featureVersion: 1,
      }),
    ],
  });

  it('does match for condition above threshold on fisrt query object', () => {
    const pageViews = [
      makePageView({
        value: VECTOR_ONE,
        version: 1,
        queryProperty: 'docVector',
      }),
    ];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(true);
  });

  it('does match for condition above threshold on second query object', () => {
    const pageViews = [
      makePageView({
        value: VECTOR_TWO,
        version: 1,
        queryProperty: 'docVector',
      }),
    ];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(true);
  });

  it('does not match for condition below threshold on every query object', () => {
    const pageViews = [
      makePageView({
        value: NOT_MATCHING_VECTOR,
        version: 1,
        queryProperty: 'docVector',
      }),
    ];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(false);
  });

  it('does match for condition above threshold on at least one (pageView, condition) pair', () => {
    expect(
      evaluateCondition(multipleNonOverlapingQueriesCondition, [
        makePageView({
          value: VECTOR_ONE,
          version: 1,
          queryProperty: 'docVector',
        }),
        makePageView({
          value: NOT_MATCHING_VECTOR,
          version: 1,
          queryProperty: 'docVector',
        }),
      ])
    ).toEqual(true);
    expect(
      evaluateCondition(multipleNonOverlapingQueriesCondition, [
        makePageView({
          value: VECTOR_TWO,
          version: 1,
          queryProperty: 'docVector',
        }),
        makePageView({
          value: NOT_MATCHING_VECTOR,
          version: 1,
          queryProperty: 'docVector',
        }),
      ])
    ).toEqual(true);
  });

  it('does not match for different (condition, pageView) versions attributes', () => {
    const pageViews = [
      makePageView({
        value: VECTOR_ONE,
        version: 2,
        queryProperty: 'docVector',
      }),
      makePageView({
        value: VECTOR_TWO,
        version: 2,
        queryProperty: 'docVector',
      }),
      makePageView({
        value: NOT_MATCHING_VECTOR,
        version: 2,
        queryProperty: 'docVector',
      }),
    ];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(false);
  });

  it('does match for mixed versions/conditions with enough above threshold pairs', () => {
    const pageViews = [
      makePageView({
        value: VECTOR_ONE,
        version: 1,
        queryProperty: 'docVector',
      }),
      makePageView({
        value: VECTOR_TWO,
        version: 2,
        queryProperty: 'docVector',
      }),
      makePageView({
        value: NOT_MATCHING_VECTOR,
        version: 2,
        queryProperty: 'docVector',
      }),
    ];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(true);
  });
});
