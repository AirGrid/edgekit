import { storage, timeStampInSecs } from '../utils'; // this is confusing...

enum StorageKeys {
  PAGE_VIEWS = 'edkt_page_views',
  MATCHED_AUDIENCES = 'edkt_matched_audiences',
  MATCHED_AUDIENCE_IDS = 'edkt_matched_audience_ids',
}

interface IMatchedAudience {
  id: string;
  matchedAt: number;
  expiresAt: number;
}

// TODO: share the types.
class AudienceStore {
  matchedAudiences: IMatchedAudience[];
  matchedAudienceIds: string[];

  constructor() {
    this.matchedAudiences = [];
    this.matchedAudienceIds = [];
    this._load();
  }

  _load() {
    const audiences: IMatchedAudience[] = storage.get(StorageKeys.MATCHED_AUDIENCES) || [];
    const unExpiredAudiences = audiences.filter(audience => audience.expiresAt > timeStampInSecs());
    const unExpiredAudienceIds = unExpiredAudiences.map(audience => audience.id);
    this.matchedAudiences = unExpiredAudiences;
    this.matchedAudienceIds = unExpiredAudienceIds;
    this._save();
  }

  _save() {
    storage.set(StorageKeys.MATCHED_AUDIENCES, this.matchedAudiences);
    storage.set(StorageKeys.MATCHED_AUDIENCE_IDS, this.matchedAudienceIds);
  }

  setMatchedAudiences(newlyMatchedAudiences: IMatchedAudience[]) {
    // TODO: decide if we need to check duplicate audiences here...

    if (newlyMatchedAudiences.length === 0) return;
    const allMatchedAudiences = [...this.matchedAudiences, ...newlyMatchedAudiences];
    this.matchedAudiences = allMatchedAudiences;
    this.matchedAudienceIds = allMatchedAudiences.map(audience => audience.id);
    this._save();
  }
};

export const audienceStore = new AudienceStore();
