import { StorageKeys, AudienceDefinition, CachedAudienceMetaData } from 'types';
import { storage, timeStampInSecs } from '../utils';

class CachedAudienceStore {
  cachedAudiences: AudienceDefinition[];
  cachedAudiencesMetaData: CachedAudienceMetaData;

  constructor() {
    this.cachedAudiences = [];
    this.cachedAudiencesMetaData = {
      cachedAt: 0,
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
      cachedAt: 0,
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

  _setAudienceCacheMetaData() {
    this.cachedAudiencesMetaData = {
      cachedAt: timeStampInSecs(),
      audiences: this.cachedAudiences.map((audience) => {
        return {
          id: audience.id,
          version: audience.version,
        };
      }),
    };
    this._save();
  }

  updateAudienceCache(audiencesToCache: AudienceDefinition[]) {
    audiencesToCache.forEach((audience) => {
      const foundAudienceIndex = this.cachedAudiences.findIndex(
        (cachedAudience) => cachedAudience.id === audience.id
      );
      if (foundAudienceIndex === -1) {
        this.cachedAudiences.push(audience);
      } else {
        this.cachedAudiences[foundAudienceIndex] = audience;
      }
    });
    this._setAudienceCacheMetaData();
    this._save();
  }
}

export const cachedAudienceStore = new CachedAudienceStore();
