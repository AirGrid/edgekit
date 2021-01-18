import { storage, timeStampInSecs } from '../utils';
import { StorageKeys, MatchedAudience } from '../../types';

export class MatchedAudienceStore {
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

  setMatchedAudiences(matchedAudiences: MatchedAudience[]): void {
    this.matchedAudiences = matchedAudiences;
    this.matchedAudienceIds = matchedAudiences.map((audience) => audience.id);
    this._save();
  }

  getMatchedAudiences(): MatchedAudience[] {
    return [...this.matchedAudiences];
  }
}

export const matchedAudienceStore = new MatchedAudienceStore();

// getPrevMatchedAudiences(
//   matchedAudiences: MatchedAudience[]
// ): MatchedAudience[] {
//   return this.matchedAudiences.filter((matchedAudience) =>
//     matchedAudiences.some((audience) =>
//       this.doesAudienceVersionMatch(audience, matchedAudience)
//     )
//   );
// }
//
// doesAudienceVersionMatch(
//   audienceFst: MatchedAudience,
//   audienceSnd: MatchedAudience
// ): boolean {
//   return (
//     audienceFst.id === audienceSnd.id &&
//     audienceFst.version === audienceSnd.version
//   );
// }
//
