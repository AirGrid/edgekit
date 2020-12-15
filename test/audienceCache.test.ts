import { cachedAudienceStore } from '../src/store';
import { CachedAudienceMetaData } from '../types';
import {
  sportInterestAudience,
  travelInterestAudience,
  automotiveInterestAudience,
} from './helpers/audienceDefinitions';
import { timeStampInSecs } from 'src/utils';
import {
  clearStore,
  getCachedAudiences,
  getCachedAudiencesMetaData
} from './helpers/localStorageSetup';

describe('Test audience cache', () => {
  beforeAll(async () => {
    clearStore()
  });

  it('Successfully adds audiences to the audience cache with local storage', async () => {
    cachedAudienceStore.updateAudienceCache([
      sportInterestAudience,
      travelInterestAudience,
      automotiveInterestAudience,
    ]);

    const edktCachedAudienceMetaData = getCachedAudiencesMetaData()

    const expectedCachedAudienceMetaData: CachedAudienceMetaData = {
      cachedAt: timeStampInSecs(),
      audiences: [
        {
          id: sportInterestAudience.id,
          version: sportInterestAudience.version,
        },
        {
          id: travelInterestAudience.id,
          version: travelInterestAudience.version,
        },
        {
          id: automotiveInterestAudience.id,
          version: automotiveInterestAudience.version,
        },
      ],
    };

    expect(getCachedAudiences().length).toEqual(3);

    // - 2 seconds incase slow test run
    expect(edktCachedAudienceMetaData.cachedAt).toBeGreaterThanOrEqual(
      timeStampInSecs() - 1
    );
    expect(edktCachedAudienceMetaData.audiences).toEqual(
      expectedCachedAudienceMetaData.audiences
    );
  });

  it('Successfully update the audience cache', async () => {
    cachedAudienceStore.updateAudienceCache([
      sportInterestAudience,
      travelInterestAudience,
    ]);

    const newVersion = 2;

    const newTravelAudience = {
      ...travelInterestAudience,
      version: newVersion,
    };

    cachedAudienceStore.updateAudienceCache([
      newTravelAudience,
      automotiveInterestAudience,
    ]);

    const edktCachedAudiences = cachedAudienceStore.cachedAudiences;

    const edktCachedAudienceMetaData =
      cachedAudienceStore.cachedAudiencesMetaData;

    expect(edktCachedAudiences.length).toEqual(3);

    const expectedCachedAudienceMetaData: CachedAudienceMetaData = {
      cachedAt: timeStampInSecs(),
      audiences: [
        {
          id: sportInterestAudience.id,
          version: sportInterestAudience.version,
        },
        {
          id: travelInterestAudience.id,
          version: newVersion,
        },
        {
          id: automotiveInterestAudience.id,
          version: automotiveInterestAudience.version,
        },
      ],
    };
    // - 2 seconds incase slow test run
    expect(edktCachedAudienceMetaData.cachedAt).toBeGreaterThanOrEqual(
      timeStampInSecs() - 1
    );
    expect(edktCachedAudienceMetaData.audiences).toEqual(
      expectedCachedAudienceMetaData.audiences
    );
    // 3 because we have only updated the version of the travel audience not the id
    expect(edktCachedAudiences.length).toEqual(3);
  });
});
