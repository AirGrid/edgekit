import { matchedAudienceStore } from '../../../src/store/matchedAudiences';
import { timeStampInSecs } from '../../../src/utils/index';
import { clearStore } from '../../helpers/localStorage';
import { MatchedAudience, AudienceDefinition } from '../../../types';

describe('matchedAudienceStore set and load behaviour', () => {
  const makeMatchedAudienceAndDefinition = (
    id: string,
    version: number
  ): [MatchedAudience, AudienceDefinition] => {
    const currentTS = timeStampInSecs();
    return [
      {
        id,
        version,
        matchedAt: currentTS,
        expiresAt: currentTS + 1000000000,
        matchedOnCurrentPageView: true,
      } as MatchedAudience,
      { id, version } as AudienceDefinition,
    ];
  };

  const unsetMatchedOnCurrentPageViewFlag = (
    audience: MatchedAudience
  ): MatchedAudience => ({
    ...audience,
    matchedOnCurrentPageView: false,
  });

  const matchedAudienceId = 'testId';
  const fixedAudienceId = 'fixedAudienceId';

  const [
    matchedAudience,
    matchedAudienceDefinition,
  ] = makeMatchedAudienceAndDefinition(matchedAudienceId, 1);
  const [
    fixedMatchedAudience,
    fixedAudienceDefinition,
  ] = makeMatchedAudienceAndDefinition(fixedAudienceId, 1);

  const [
    _rematchedAudience,
    rematchedAudienceDefinition,
  ] = makeMatchedAudienceAndDefinition(matchedAudienceId, 2);
  const rematchedAudience = unsetMatchedOnCurrentPageViewFlag(
    _rematchedAudience
  );

  const [
    newlyMatchedAudience,
    newlyMatchedAudienceDefinition,
  ] = makeMatchedAudienceAndDefinition('totallyNewAudience', 1);

  const oldMatchedAudience = unsetMatchedOnCurrentPageViewFlag(matchedAudience);
  const oldFixedMatchedAudience = unsetMatchedOnCurrentPageViewFlag(
    fixedMatchedAudience
  );

  beforeAll(clearStore);

  // triggers load as in a new edkt run
  beforeEach(() => matchedAudienceStore._load());

  it('should set `matchedOnCurrentPageView` flag for newly matched audiences', () => {
    const matchedAudiences = matchedAudienceStore.getMatchedAudiences();
    expect(matchedAudiences).toHaveLength(0);

    matchedAudienceStore.updateMatchedAudiences(
      [
        matchedAudience,
        fixedMatchedAudience, // add this so we know we don't mess with the other audiences
      ],
      [matchedAudienceDefinition, fixedAudienceDefinition]
    );

    const storedMatchedAudiences = matchedAudienceStore.getMatchedAudiences();
    expect(storedMatchedAudiences).toHaveLength(2);
    expect(storedMatchedAudiences).toContainEqual(matchedAudience);
    expect(storedMatchedAudiences).toContainEqual(fixedMatchedAudience);
  });

  it('should unset `matchedOnCurrentPageView` flag on load', () => {
    const oldMatchedAudiences = matchedAudienceStore.getMatchedAudiences();
    expect(oldMatchedAudiences).toHaveLength(2);
    expect(oldMatchedAudiences).toContainEqual(oldMatchedAudience);
    expect(oldMatchedAudiences).toContainEqual(oldFixedMatchedAudience);
  });

  it('should preserve `matchedOnCurrentPageView` flag and timestamps on rematched audiences', () => {
    matchedAudienceStore.updateMatchedAudiences(
      [rematchedAudience],
      [rematchedAudienceDefinition, fixedAudienceDefinition]
    );

    const matchedAudiences = matchedAudienceStore.getMatchedAudiences();
    expect(matchedAudiences).toHaveLength(2);
    expect(matchedAudiences).toContainEqual(rematchedAudience);
    expect(matchedAudiences).toContainEqual(oldFixedMatchedAudience);
  });

  it('should not mess with old audiences on new additions', () => {
    matchedAudienceStore.updateMatchedAudiences(
      [newlyMatchedAudience],
      [
        newlyMatchedAudienceDefinition,
        rematchedAudienceDefinition,
        fixedAudienceDefinition,
      ]
    );

    const oldRematchedAudience = unsetMatchedOnCurrentPageViewFlag(
      rematchedAudience
    );

    const matchedAudiences = matchedAudienceStore.getMatchedAudiences();
    expect(matchedAudiences).toHaveLength(3);
    expect(matchedAudiences).toContainEqual(newlyMatchedAudience);
    expect(matchedAudiences).toContainEqual(oldRematchedAudience);
    expect(matchedAudiences).toContainEqual(oldFixedMatchedAudience);
  });
});
