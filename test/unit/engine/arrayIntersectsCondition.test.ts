import { check } from '../../../src/engine';
import { PageView, EngineConditionRule } from '../../../types';
import {
  makeEngineCondition,
  makeSportsPageView,
  makeTestPageView,
} from '../../helpers/engineConditions';
import { makeStringArrayQuery } from '../../helpers/audienceDefinitions';

describe('engine test with sports condition', () => {
  const sports1xCondition = (
    matcherCondition: EngineConditionRule['matcher']['name']
  ) =>
    makeEngineCondition([makeStringArrayQuery(['sport'])], 1, matcherCondition);

  it('evaluates first model with gt matcher', async () => {
    const conditions = [sports1xCondition('gt')];
    const pageViews = [makeSportsPageView(100), makeSportsPageView(101)];

    const result = check(conditions, pageViews);

    expect(result).toEqual(true);
  });

  it('evaluates first model with lt matcher', async () => {
    const conditions = [sports1xCondition('lt')];
    const pageViews = [makeTestPageView(100), makeTestPageView(101)];

    const result = check(conditions, pageViews);

    expect(result).toEqual(true);
  });

  it('evaluates first model with eq matcher', async () => {
    const conditions = [sports1xCondition('eq')];
    const pageViews = [makeSportsPageView(100), makeTestPageView(101)];

    const result = check(conditions, pageViews);

    expect(result).toEqual(true);
  });

  it('evaluates first model with ge matcher', async () => {
    const conditions = [sports1xCondition('ge')];
    const pageViews: PageView[] = [
      makeSportsPageView(100),
      makeTestPageView(101),
    ];
    const pageViews2: PageView[] = [
      makeSportsPageView(100),
      makeSportsPageView(101),
    ];

    const result = check(conditions, pageViews);
    const result2 = check(conditions, pageViews2);

    expect(result).toEqual(true);
    expect(result2).toEqual(true);
  });

  it('evaluates first model with le matcher', async () => {
    const conditions = [sports1xCondition('le')];
    const pageViews: PageView[] = [
      makeTestPageView(100),
      makeTestPageView(101),
    ];
    const pageViews2: PageView[] = [
      makeSportsPageView(100),
      makeTestPageView(101),
    ];

    const result = check(conditions, pageViews);
    const result2 = check(conditions, pageViews2);

    expect(result).toEqual(true);
    expect(result2).toEqual(true);
  });

  it('evaluates first model with a false match', async () => {
    const conditions = [sports1xCondition('gt')];
    const pageViews = [makeTestPageView(100), makeTestPageView(101)];
    const pageViews2 = [makeSportsPageView(100), makeTestPageView(101)];

    const result = check(conditions, pageViews);
    const result2 = check(conditions, pageViews2);

    expect(result).toEqual(false);
    expect(result2).toEqual(false);
  });
});
