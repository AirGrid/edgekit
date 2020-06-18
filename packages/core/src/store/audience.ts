import { get, set, timeStampInSecs } from './utils';

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

// TODO: define the types.
class AudienceStore {
  matchedAudiences: IMatchedAudience[];
  matchedAudienceIds: string[];

  constructor() {
    this.matchedAudiences = this._loadMatchedAudiences();
    this.matchedAudienceIds = this.getMatchedAudienceIds();
  }

  _loadMatchedAudiences() {
    const audiences: IMatchedAudience[] = get(StorageKeys.MATCHED_AUDIENCES) || [];
    const unExpiredAudiences = audiences.filter(audience => audience.expiresAt > timeStampInSecs());
    set(StorageKeys.MATCHED_AUDIENCES, unExpiredAudiences);
    return unExpiredAudiences;
  }

  _loadMatchedAudienceIds() {
    // TODO: do we need to check if audiences are loaded?
    this.matchedAudienceIds = this.matchedAudiences.map(audience => audience.id);
    set(StorageKeys.MATCHED_AUDIENCE_IDS, this.matchedAudienceIds);
  }

  getMatchedAudiences() {
    return this.matchedAudiences;
  }

  setMatchedAudiences(newlyMatchedAudiences: IMatchedAudience[]) {
    // TODO: decide if we need to check duplicate audiences here...

    // if(nomatchedwereturn)
    const allMatchedAudiences = [...this.matchedAudiences, ...newlyMatchedAudiences];
    this.matchedAudiences = allMatchedAudiences;
    this.matchedAudienceIds = this.getMatchedAudienceIds();
    set(
      StorageKeys.MATCHED_AUDIENCES, 
      this.matchedAudiences
    );
    set(
      StorageKeys.MATCHED_AUDIENCE_IDS, 
      this.matchedAudienceIds
    );
  }

  getMatchedAudienceIds() {
    return this.matchedAudiences.map(audience => audience.id);
  }
};

export const audienceStore = new AudienceStore();
