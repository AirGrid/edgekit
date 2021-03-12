import { storage, timeStampInSecs } from '../utils';
import { StorageKeys, MatchedAudience, AudienceDefinition } from '../../types';

type MatchedAudiences = {
  [key:string]: MatchedAudience
}

class MatchedAudienceStore {
  private matchedAudiences: MatchedAudiences;
  private matchedAudienceIds: string[];
  private storeLoadedAt: number;

  constructor() {
    this.matchedAudiences = {};
    this.matchedAudienceIds = [];
    this.storeLoadedAt = timeStampInSecs();
  }

  _save(): void {
    storage.set(StorageKeys.MATCHED_AUDIENCES, this.matchedAudiences);
    storage.set(StorageKeys.MATCHED_AUDIENCE_IDS, this.matchedAudienceIds);
  }

  _hasAudienceExpired(expiresAt: number): boolean {
    return (expiresAt < this.storeLoadedAt)
  }

  _unsetAudience(id: string): void {
    delete this.matchedAudiences[id];
  }

  _updatePageViewFlag(id: string): void {
    this.matchedAudiences[id].matchedOnCurrentPageView = false;
  }

  _load(): void {
    // TODO: @ydennisy remove this backward compat code.
    let loadedAudiences: MatchedAudiences =
      storage.get(StorageKeys.MATCHED_AUDIENCES) || {};
    
    if (Array.isArray(loadedAudiences)) {
      storage.remove(StorageKeys.MATCHED_AUDIENCES);
      loadedAudiences = loadedAudiences.reduce((acc, cur) => {
        acc[cur.id] = cur;
      }, {})
    }

    Object.entries(loadedAudiences).forEach(([id, audience]) => {
      if (this._hasAudienceExpired(audience.expiresAt)) {
        this._unsetAudience(id);
      }
      this._updatePageViewFlag(id);
    });

    this.matchedAudienceIds = Object.keys(this.matchedAudiences);
    this._save();
  }

  unsetAudiencesIfVersionIncremented(audienceDefinitions: AudienceDefinition[]): void {
    audienceDefinitions.forEach((audience) => {
      const incomingVersion = audience.version;
      const currentVersion = this.matchedAudiences[audience.id] ? this.matchedAudiences[audience.id].version : false
      if (currentVersion && currentVersion < incomingVersion) {
        delete this.matchedAudiences[audience.id];
      }
    });
  }

  isMatched(id: string, version: number): boolean {
    return (
      this.matchedAudiences[id] && this.matchedAudiences[id].version >= version
    )
  }

  setAudiences(matchedAudiences: MatchedAudience[]) {
    matchedAudiences.forEach((audience) => {
      this.matchedAudiences[audience.id] = audience;
    });
  }

  getMatchedAudiences() {
    // TODO: this is for backward compat.
    return Object.entries(this.matchedAudiences).map(([_, audience]) => audience)
  }

}

export const matchedAudienceStore = new MatchedAudienceStore();
