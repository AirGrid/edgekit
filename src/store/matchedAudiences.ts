import { storage, timeStampInSecs } from '../utils';
import { StorageKeys, MatchedAudience, AudienceDefinition } from '../../types';
import * as engine from '../engine';
import { ViewStore } from '../store/pageview';

const doesAudienceVersionMatch = (
  audience: AudienceDefinition,
  matchedAudience: MatchedAudience
) =>
  audience.id === matchedAudience.id &&
  audience.version === matchedAudience.version;

class MatchedAudienceStore {
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
  }

  getMatchedAudiences(): MatchedAudience[] {
    return [...this.matchedAudiences];
  }

  saveMatchingAudiences(
    audienceDefinitions: AudienceDefinition[],
    viewStore: ViewStore
  ): void {
    const currentTS = timeStampInSecs();

    const newlyMatchedAudiences = audienceDefinitions
      // drop prev matched audiences with same version
      .filter((audience) => {
        return !this.matchedAudiences.some((matchedAudience) =>
          doesAudienceVersionMatch(audience, matchedAudience)
        );
      })
      // translate audience definitions into engine queries
      .map((audience) => {
        return {
          ...audience,
          conditions: engine.translate(audience),
        };
      })
      // check if query matches any pageViews
      .map((query) => {
        // TODO Ideally pageViewsWithinLookBack should be passed as
        // argument to saveMatchingAudiences methods, but as it is now
        // we got to take the entire viewStore instance as arg,
        // or else there will be repetition.
        const pageViewsWithinLookBack = viewStore.getPageViewsWithinLookBack(
          query.lookBack
        );
        return {
          id: query.id,
          version: query.version,
          matchedAt: currentTS,
          expiresAt: currentTS + query.ttl,
          matchedOnCurrentPageView: true,
          matched: engine.check(query.conditions, pageViewsWithinLookBack),
        };
      })
      // keep only matched audiences
      .filter((audience) => audience.matched);

    // We also want to keep prev matched audiences with matching versions
    const prevMatchedAudiences = this.matchedAudiences.filter(
      (matchedAudience) =>
        audienceDefinitions.some((audience) =>
          doesAudienceVersionMatch(audience, matchedAudience)
        )
    );

    this.setMatchedAudiences([
      ...prevMatchedAudiences,
      ...newlyMatchedAudiences,
    ]);

    this._save();
  }
}

export const matchedAudienceStore = new MatchedAudienceStore();
