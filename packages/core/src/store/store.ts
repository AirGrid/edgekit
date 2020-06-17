import { get, set, timeStampInSecs } from './utils';

enum StorageKeys {
  PAGE_VIEWS = 'edkt_page_views',
  MATCHED_AUDIENCES = 'edkt_matched_audiences',
}

// TODO: define the types.
class AudienceStore {
  matchedAudiences: object[];
  matchedAudienceIds: string[];
  constructor() {
    this.matchedAudiences = this.loadMatchedAudiences();
    this.matchedAudienceIds = this.getMatchedAudienceIds();
  }
  loadMatchedAudiences() {
    const audiences = get(StorageKeys.MATCHED_AUDIENCES) || [];
    const unExpiredAudiences = audiences.filter(audience => audience.expiresAt > timeStampInSecs());
    set(StorageKeys.MATCHED_AUDIENCES, unExpiredAudiences);
    return unExpiredAudiences;
  }
  getMatchedAudiences() {
    return this.matchedAudiences;
  }
  setMatchedAudiences(newlyMatchedAudiences) {
    // are any checks needed here?
    const allMatchedAudiences = this.matchedAudiences.concat(newlyMatchedAudiences);
    this.matchedAudiences = allMatchedAudiences;
    this.matchedAudienceIds = this.getMatchedAudienceIds();
    set(
      StorageKeys.MATCHED_AUDIENCES, 
      allMatchedAudiences
    );
  }
  getMatchedAudienceIds() {
    return this.matchedAudiences.map(audience => audience.id);
  }
}

export const audienceStore = new AudienceStore();