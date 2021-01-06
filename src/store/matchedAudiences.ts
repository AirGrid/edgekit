import { storage, timeStampInSecs } from '../utils';
import { StorageKeys, MatchedAudience } from '../../types';

class MatchedAudienceStore {
  matchedAudiences: MatchedAudience[];
  matchedAudienceIds: string[];

  constructor() {
    this.matchedAudiences = [];
    this.matchedAudienceIds = [];
    this._load();
  }

  _load() {
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

  _save() {
    storage.set(StorageKeys.MATCHED_AUDIENCES, this.matchedAudiences);
    storage.set(StorageKeys.MATCHED_AUDIENCE_IDS, this.matchedAudienceIds);
  }

  setMatchedAudiences(matchedAudiences: MatchedAudience[]) {
    this.matchedAudiences = matchedAudiences;
    this.matchedAudienceIds = matchedAudiences.map((audience) => audience.id);
    this._save();
  }
}

export const matchedAudienceStore = new MatchedAudienceStore();
