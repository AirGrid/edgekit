import { storage, timeStampInSecs } from '../utils';
import { StorageKeys, MatchedAudience } from '../../types';

type MatchedVersionLookup = {
  [key: string]: number;
};

class MatchedAudienceStore {
  private matchedAudiences: MatchedAudience[];
  private matchedAudienceIds: string[];
  private matchedVersionLookup: MatchedVersionLookup;

  constructor() {
    this.matchedAudiences = [];
    this.matchedAudienceIds = [];
    this.matchedVersionLookup = {};
    this._load();
  }

  _createMatchedVersionLookup(
    audiences: MatchedAudience[]
  ): MatchedVersionLookup {
    return audiences.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.id]: cur.version,
      }),
      {}
    );
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
    this.matchedVersionLookup = this._createMatchedVersionLookup(
      unExpiredAudiences
    );
    this._save();
  }

  _save(): void {
    storage.set(StorageKeys.MATCHED_AUDIENCES, this.matchedAudiences);
    storage.set(StorageKeys.MATCHED_AUDIENCE_IDS, this.matchedAudienceIds);
  }

  hasAudienceBeenMatched(audienceId: string, audienceVersion: number): boolean {
    if (this.matchedVersionLookup[audienceId]) {
      if (this.matchedVersionLookup[audienceId] >= audienceVersion) {
        return true;
      }
    }
    return false;
  }

  setMatchedAudiences(matchedAudiences: MatchedAudience[]): void {
    const audiencesMatchedOnCurrentLoad = matchedAudiences.map((audience) => {
      if (this.matchedVersionLookup[audience.id]) {
        audience.matchedOnCurrentPageView = false;
      }
      return audience;
    });
    this.matchedAudiences = [
      ...this.matchedAudiences,
      ...audiencesMatchedOnCurrentLoad,
    ];
    this.matchedVersionLookup = this._createMatchedVersionLookup(
      this.matchedAudiences
    );
    this.matchedAudienceIds = this.matchedAudiences.map(
      (audience) => audience.id
    );
    this._save();
  }

  getMatchedAudiences(): MatchedAudience[] {
    return [...this.matchedAudiences];
  }
}

export const matchedAudienceStore = new MatchedAudienceStore();
