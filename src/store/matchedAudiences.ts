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

  updateMatchedAudiences(
    matchedAudiences: MatchedAudience[],
    audienceDefinitions: AudienceDefinition[]
  ): void {
    const newlyMatchedAudienceIds = matchedAudiences.map(
      (audience) => audience.id
    );

    // get old matched audiences with bumped version
    const rematchedAudiences = this.matchedAudiences
      .filter((audience) => newlyMatchedAudienceIds.includes(audience.id))
      .map((audience) => {
        const newlyMatchedAudience = matchedAudiences.find(
          (newAudience) => newAudience.id === audience.id
        );
        // typescript says this can be undefined, so lets check it
        if (!newlyMatchedAudience) return audience;
        return {
          ...audience,
          version: newlyMatchedAudience.version,
        };
      });

    // get the newly matched audiences that are not previously matched
    const newlyMatchedAudiences = matchedAudiences.filter(
      (audience) => !this.matchedAudienceIds.includes(audience.id)
    );

    // get the old matched audiences which are not version bumped (excluding the ones that are not rematched)
    const oldMatchedAudiences = this.matchedAudiences.filter((audience) => {
      const definition = audienceDefinitions.find(
        (def) => def.id === audience.id
      );
      if (!definition) return false;
      return (
        !newlyMatchedAudienceIds.includes(audience.id) &&
        audience.version === definition.version
      );
    });

    // merge previously matched (version bumped) audiences with newly matched ones
    const mergedMatchedAudiences = [
      ...oldMatchedAudiences,
      ...rematchedAudiences,
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
}

export const matchedAudienceStore = new MatchedAudienceStore();
