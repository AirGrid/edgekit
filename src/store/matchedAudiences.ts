import { storage, timeStampInSecs } from '../utils';
import { StorageKeys, MatchedAudience, AudienceDefinition } from '../../types';

class MatchedAudienceStore {
  private matchedAudiences: MatchedAudience[];
  private matchedAudienceIds: string[];

  constructor() {
    this.matchedAudiences = [];
    this.matchedAudienceIds = [];
    this._load();
  }

  _load(): void {
    const audiences: MatchedAudience[] =
      storage.get(StorageKeys.MATCHED_AUDIENCES) || [];

    const unExpiredAudiences = audiences
      .filter((audience) => audience.expiresAt > timeStampInSecs())
      .map((audience) => {
        return {
          ...audience,
          matchedOnCurrentPageView: false,
        };
      });
    const unExpiredAudienceIds = unExpiredAudiences.map(
      (audience) => audience.id
    );
    this.matchedAudiences = unExpiredAudiences;
    this.matchedAudienceIds = unExpiredAudienceIds;
    this._save();
  }

  _save(): void {
    storage.set(StorageKeys.MATCHED_AUDIENCES, this.matchedAudiences);
    storage.set(StorageKeys.MATCHED_AUDIENCE_IDS, this.matchedAudienceIds);
  }

  _getRematchedAudiences = (
    prevState: MatchedAudience[],
    candidateMatchedAudienceIds: string[]
  ) =>
    prevState.filter((audience) =>
      // new matched ids does include audienceId, so it is a rematched one
      candidateMatchedAudienceIds.includes(audience.id)
    );

  _bumpRematchedAudiencesVersion = (
    rematchedAudiences: MatchedAudience[],
    candidateMatchedAudiences: MatchedAudience[]
  ) =>
    rematchedAudiences.map((audience) => {
      const rematchedAudience = candidateMatchedAudiences.find(
        (newAudience) => newAudience.id === audience.id
      );
      // typescript says this can be undefined, so lets check it
      if (!rematchedAudience) return audience;
      return {
        ...audience,
        version: rematchedAudience.version,
      };
    });

  _getNewlyMatchedAudiences = (
    candidateMatchedAudiences: MatchedAudience[],
    prevStateIds: string[]
  ) =>
    candidateMatchedAudiences.filter(
      (audience) => !prevStateIds.includes(audience.id)
    );

  _getOldMatchedAudiences = (
    prevState: MatchedAudience[],
    candidateMatchedAudienceIds: string[],
    audienceDefinitions: AudienceDefinition[]
  ) =>
    prevState.filter((audience) => {
      // preserve only the audiences which still have a query defined
      const definition = audienceDefinitions.find(
        (def) => def.id === audience.id
      );

      // drop the ones which are rematched/versionBumped
      if (!definition) return false;
      return (
        // new matched ids does not include audienceId, so it is an old one
        !candidateMatchedAudienceIds.includes(audience.id) &&
        // and it has not been version bumped
        audience.version === definition.version
      );
    });

  updateMatchedAudiences(
    candidateMatchedAudiences: MatchedAudience[],
    audienceDefinitions: AudienceDefinition[]
  ): void {
    // for better readability
    const prevState = this.matchedAudiences;
    const prevStateIds = this.matchedAudienceIds;

    // get candidate ids
    const candidateMatchedAudienceIds = candidateMatchedAudiences.map(
      (audience) => audience.id
    );

    // get old (re)matched audiences with bumped version
    const rematchedAudiences = this._getRematchedAudiences(
      prevState,
      candidateMatchedAudienceIds
    );
    const bumpedAudiences = this._bumpRematchedAudiencesVersion(
      rematchedAudiences,
      candidateMatchedAudiences
    );

    // get the newly matched audiences that are not previously matched
    const newlyMatchedAudiences = this._getNewlyMatchedAudiences(
      candidateMatchedAudiences,
      prevStateIds
    );

    // get the old matched audiences which are not version bumped,
    // excluding the ones that are not rematched
    const oldMatchedAudiences = this._getOldMatchedAudiences(
      prevState,
      candidateMatchedAudienceIds,
      audienceDefinitions
    );

    // merge previously matched (version bumped) audiences with newly matched ones
    const mergedMatchedAudiences = [
      ...oldMatchedAudiences,
      ...bumpedAudiences,
      ...newlyMatchedAudiences,
    ];

    const mergedMatchedAudiencesIds = mergedMatchedAudiences.map(
      ({ id }) => id
    );

    this.matchedAudiences = mergedMatchedAudiences;
    this.matchedAudienceIds = mergedMatchedAudiencesIds;
    this._save();
  }

  getMatchedAudiences(): MatchedAudience[] {
    return [...this.matchedAudiences];
  }

  filterNewAudienceDefinitions = (audienceDefinitions: AudienceDefinition[]) =>
    audienceDefinitions.filter(
      (definition) =>
        !this.matchedAudiences.find(
          (oldMatchedAudience) =>
            definition.id === oldMatchedAudience.id &&
            definition.version === oldMatchedAudience.version
        )
    );
}

export const matchedAudienceStore = new MatchedAudienceStore();
