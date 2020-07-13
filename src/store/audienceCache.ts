import {
  StorageKeys,
  AudienceDefinition,
  CachedAudienceMetaData,
} from '../../types';
import { storage, timeStampInSecs } from '../utils';

class AudienceCache {
  cachedAudiences: AudienceDefinition[];
  cachedAudiencesMetaData: CachedAudienceMetaData;

  constructor() {
    this.cachedAudiences = [];
    this.cachedAudiencesMetaData = {
      checkedAt: 0,
      audiences: [],
    };
    this._load();
  }

  _load() {
    const audiences: AudienceDefinition[] =
      storage.get(StorageKeys.CACHED_AUDIENCES) || [];
    const audiencesMetaData: CachedAudienceMetaData = storage.get(
      StorageKeys.CACHED_AUDIENCE_META_DATA
    ) || {
      checkedAt: 0,
      audiences: [],
    };
    this.cachedAudiences = audiences;
    this.cachedAudiencesMetaData = audiencesMetaData;
    this._save();
  }

  _save() {
    storage.set(StorageKeys.CACHED_AUDIENCES, this.cachedAudiences);
    storage.set(
      StorageKeys.CACHED_AUDIENCE_META_DATA,
      this.cachedAudiencesMetaData
    );
  }

  setAudienceCache(audiencesToCache: AudienceDefinition[]) {
    this.cachedAudiences = audiencesToCache;
    this.cachedAudiencesMetaData = {
      checkedAt: timeStampInSecs(),
      audiences: audiencesToCache.map((audience) => {
        return {
          id: audience.id,
          version: audience.version,
        };
      }),
    };
    this._save();
  }

  getAudienceCache() {
    return this.cachedAudiences;
  }

  getAudienceCacheMetaData() {
    return this.cachedAudiencesMetaData;
  }
}

export const audienceCache = new AudienceCache();
