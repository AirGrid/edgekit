import { evaluateCondition } from '../../../src/engine';
import {
  makeEngineCondition,
  makePageView,
} from '../../helpers/engineConditions';
import { makeCosineSimilarityQuery } from '../../helpers/audienceDefinitions';

describe('engine matching behaviour for multiple engine condition values', () => {
  const vectorOne = [0, 1, 0];
  const vectorTwo = [1, 0, 0];
  const notMatchingVector = [0, 0, 1];

  const multipleNonOverlapingQueriesCondition = makeEngineCondition({
    queries: [
      makeCosineSimilarityQuery({
        queryValue: {
          vector: vectorOne,
          threshold: 0.99,
        },
        featureVersion: 1,
      }),
      makeCosineSimilarityQuery({
        queryValue: {
          vector: vectorTwo,
          threshold: 0.99,
        },
        featureVersion: 1,
      }),
    ],
    occurences: 1,
  });

  it('does match for condition above threshold on fisrt query object', () => {
    const pageViews = [makePageView({ value: vectorOne, version: 1 })];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(true);
  });

  it('does match for condition above threshold on second query object', () => {
    const pageViews = [makePageView({ value: vectorTwo, version: 1 })];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(true);
  });

  it('does not match for condition below threshold on every query object', () => {
    const pageViews = [makePageView({ value: notMatchingVector, version: 1 })];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(false);
  });

  it('does match for condition above threshold on at least one (pageView, condition) pair', () => {
    expect(
      evaluateCondition(multipleNonOverlapingQueriesCondition, [
        makePageView({ value: vectorOne, version: 1 }),
        makePageView({ value: notMatchingVector, version: 1 }),
      ])
    ).toEqual(true);
    expect(
      evaluateCondition(multipleNonOverlapingQueriesCondition, [
        makePageView({ value: vectorTwo, version: 1 }),
        makePageView({ value: notMatchingVector, version: 1 }),
      ])
    ).toEqual(true);
  });

  it('does not match for different (condition, pageView) versions attributes', () => {
    const pageViews = [
      makePageView({ value: vectorOne, version: 2 }),
      makePageView({ value: vectorTwo, version: 2 }),
      makePageView({ value: notMatchingVector, version: 2 }),
    ];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(false);
  });

  it('does match for mixed versions/conditions with enough above threshold pairs', () => {
    const pageViews = [
      makePageView({ value: vectorOne, version: 1 }),
      makePageView({ value: vectorTwo, version: 2 }),
      makePageView({ value: notMatchingVector, version: 2 }),
    ];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(true);
  });
});
