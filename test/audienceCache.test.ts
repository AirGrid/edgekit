import {
  sportInterestAudience,
  travelInterestAudience,
  automotiveInterestAudience,
} from '../src';
import { audienceCacheStore } from '../src/store';
import { CachedAudienceMetaData } from 'types';
import { timeStampInSecs } from 'src/utils';

describe('Test audience cache', () => {
  beforeAll(async () => {
    localStorage.clear();
  });

  it('Successfully adds audiences to the audience cache with local storage', async () => {
    audienceCacheStore.setAudienceCache([
      sportInterestAudience,
      travelInterestAudience,
      automotiveInterestAudience,
    ]);

    const edktCachedAudiences = JSON.parse(
      localStorage.getItem('edkt_cached_audiences') || '[]'
    );

    const edktCachedAudienceMetaData = JSON.parse(
      localStorage.getItem('edkt_cached_audience_meta_data') || '[]'
    );

    expect(edktCachedAudiences.length).toEqual(3);

    const expectedCachedAudienceMetaData: CachedAudienceMetaData = {
      timeChecked: timeStampInSecs(),
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
    // - 2 seconds incase slow test run
    expect(edktCachedAudienceMetaData.timeChecked).toBeGreaterThanOrEqual(
      timeStampInSecs() - 1
    );
    expect(edktCachedAudienceMetaData.audiences).toEqual(
      expectedCachedAudienceMetaData.audiences
    );
  });

  it('Successfully adds audiences to the audience cache with methods', async () => {
    audienceCacheStore.setAudienceCache([
      sportInterestAudience,
      travelInterestAudience,
      automotiveInterestAudience,
    ]);

    const edktCachedAudiences = audienceCacheStore.getAudienceCache();

    const edktCachedAudienceMetaData = audienceCacheStore.getAudienceCacheMetaData();

    expect(edktCachedAudiences.length).toEqual(3);

    const expectedCachedAudienceMetaData: CachedAudienceMetaData = {
      timeChecked: timeStampInSecs(),
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
    // - 2 seconds incase slow test run
    expect(edktCachedAudienceMetaData.timeChecked).toBeGreaterThanOrEqual(
      timeStampInSecs() - 1
    );
    expect(edktCachedAudienceMetaData.audiences).toEqual(
      expectedCachedAudienceMetaData.audiences
    );
  });
});
