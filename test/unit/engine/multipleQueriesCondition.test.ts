import { evaluateCondition } from '../../../src/engine';
import {
  makeEngineCondition,
  makeTopicDistPageView,
} from '../../helpers/engineConditions';
import { makeCosineSimilarityQuery } from '../../helpers/audienceDefinitions';

describe('engine matching behaviour for multiple engine condition values', () => {
  const multipleNonOverlapingQueriesCondition = makeEngineCondition(
    [
      makeCosineSimilarityQuery({
        queryValue: {
          vector: [0, 1, 0],
          threshold: 0.99,
        },
        featureVersion: 1,
      }),
      makeCosineSimilarityQuery({
        queryValue: {
          vector: [1, 0, 0],
          threshold: 0.99,
        },
        featureVersion: 1,
      }),
    ],
    1
  );

  it('does match for condition above threshold on fisrt query object', () => {
    const pageViews = [makeTopicDistPageView([1, 0, 0], 1)];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(true);
  });

  it('does match for condition above threshold on second query object', () => {
    const pageViews = [makeTopicDistPageView([0, 1, 0], 1)];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(true);
  });

  it('does not match for condition below threshold on every query object', () => {
    const pageViews = [makeTopicDistPageView([0, 0, 1], 1)];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(false);
  });

  it('does match for condition above threshold on at least one (pageView, condition) pair', () => {
    expect(
      evaluateCondition(multipleNonOverlapingQueriesCondition, [
        makeTopicDistPageView([1, 0, 0], 1),
        makeTopicDistPageView([0, 0, 1], 1),
      ])
    ).toEqual(true);
    expect(
      evaluateCondition(multipleNonOverlapingQueriesCondition, [
        makeTopicDistPageView([0, 1, 0], 1),
        makeTopicDistPageView([0, 0, 1], 1),
      ])
    ).toEqual(true);
  });

  it('does not match for different (condition, pageView) versions attributes', () => {
    const pageViews = [
      makeTopicDistPageView([1, 0, 0], 2),
      makeTopicDistPageView([0, 1, 0], 2),
      makeTopicDistPageView([0, 0, 1], 2),
      makeTopicDistPageView([1, 1, 1], 2),
    ];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(false);
  });

  it('does match for mixed versions/conditions with enough evidence', () => {
    const pageViews = [
      makeTopicDistPageView([1, 0, 0], 1),
      makeTopicDistPageView([0, 1, 0], 2),
      makeTopicDistPageView([0, 0, 1], 2),
      makeTopicDistPageView([1, 1, 1], 2),
    ];

    const result = evaluateCondition(
      multipleNonOverlapingQueriesCondition,
      pageViews
    );

    expect(result).toEqual(true);
  });
});
