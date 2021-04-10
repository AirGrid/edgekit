import { storage, timeStampInSecs } from '../utils';
import {
  StorageKeys,
  MatchedAudience,
  MatchedAudiences,
  AudienceDefinition,
} from '../../types';

class MatchedAudienceStore {
  private matchedAudiences: MatchedAudiences;
  private matchedAudienceIds: string[];
  private unsetDueToVersionIncAudienceIds: string[];
  private storeLoadedAt: number;

  constructor() {
    this.matchedAudiences = {};
    this.matchedAudienceIds = [];
    this.unsetDueToVersionIncAudienceIds = [];
    this.storeLoadedAt = timeStampInSecs();
    this._load();
  }

  _save(): void {
    storage.set(StorageKeys.MATCHED_AUDIENCES, this.matchedAudiences);
    storage.set(StorageKeys.MATCHED_AUDIENCE_IDS, this.matchedAudienceIds);
  }

  _hasAudienceExpired(expiresAt: number): boolean {
    return expiresAt < this.storeLoadedAt;
  }

  _unsetAudience(id: string): void {
    delete this.matchedAudiences[id];
  }

  _updatePageViewFlag(id: string, state: boolean): void {
    this.matchedAudiences[id].matchedOnCurrentPageView = state;
  }

  _load(): void {
    // TODO: @ydennisy remove this backward compat code.
    // https://github.com/AirGrid/edgekit/issues/152
    let loadedAudiences: MatchedAudiences =
      storage.get(StorageKeys.MATCHED_AUDIENCES) || {};

    if (Array.isArray(loadedAudiences)) {
      storage.remove(StorageKeys.MATCHED_AUDIENCES);
      loadedAudiences = loadedAudiences.reduce((acc, cur) => {
        acc[cur.id] = cur;
      }, {});
    }

    this.matchedAudiences = loadedAudiences;

    Object.entries(loadedAudiences).forEach(([id, audience]) => {
      if (this._hasAudienceExpired(audience.expiresAt)) {
        this._unsetAudience(id);
        return;
      }
      this._updatePageViewFlag(id, false);
    });

    this.matchedAudienceIds = Object.keys(this.matchedAudiences);
    this._save();
  }

  unsetAudiencesIfVersionIncremented(
    audienceDefinitions: AudienceDefinition[]
  ): void {
    audienceDefinitions.forEach((audience) => {
      const incomingVersion = audience.version;
      const currentVersion = this.matchedAudiences[audience.id]
        ? this.matchedAudiences[audience.id].version
        : null;
      if (currentVersion && currentVersion < incomingVersion) {
        this._unsetAudience(audience.id);
        this.unsetDueToVersionIncAudienceIds.push(audience.id);
      }
    });
  }

  isMatched(id: string, version: number): boolean {
    return !!(
      this.matchedAudiences[id] && this.matchedAudiences[id].version >= version
    );
  }

  setAudiences(matchedAudiences: MatchedAudience[]) {
    matchedAudiences.forEach((audience) => {
      this.matchedAudiences[audience.id] = audience;
      if (this.unsetDueToVersionIncAudienceIds.includes(audience.id)) {
        this._updatePageViewFlag(audience.id, false);
      }
    });
    this.matchedAudienceIds = Object.keys(this.matchedAudiences);
    this._save();
  }

  getMatchedAudiences() {
    // TODO: this is for backward compat.
    // https://github.com/AirGrid/edgekit/issues/152
    return Object.entries(this.matchedAudiences).map(
      ([_, audience]) => audience
    );
  }
}

export const matchedAudienceStore = new MatchedAudienceStore();
