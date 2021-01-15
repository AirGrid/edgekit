import { viewStore } from '../../src/store';
import { edkt } from '../../src';
import { getPageViews } from '../helpers/localStorageSetup';

describe('ViewStore cleaning behaviour', () => {
  const vendorIds = [873];
  const omitGdprConsent = true;

  const oldFeatures = {
    keywords: {
      version: 1,
      value: ['Haskell Curry', 'death', 'combinatory logic'],
    },
  };

  const newFeatures = {
    keywords: {
      version: 1,
      value: ['virus', 'politics', 'ai'],
    },
  };

  beforeEach(() => {
    localStorage.clear();
    viewStore._load();
  });

  afterAll(() => {
    localStorage.clear();
  });

  it('should delete old pageView entries beyond maxStorageSize', async () => {
    viewStore.setStorageSize(Infinity);

    for (let i = 1; i < 9; i++) {
      // Stub Date object
      jest
        .spyOn(global.Date, 'now')
        .mockImplementationOnce(() =>
          new Date(`2000-12-0${i}T09:00:00.333Z`).valueOf()
        );
      await edkt.run({
        pageFeatures: oldFeatures,
        audienceDefinitions: [],
        omitGdprConsent,
        vendorIds,
      });
    }

    expect(getPageViews()).toHaveLength(8);

    // runs with newer timestamp
    const newerDate = new Date(`2010-12-01T09:00:00.333Z`).valueOf();
    jest.spyOn(global.Date, 'now').mockImplementationOnce(() => newerDate);
    await edkt.run({
      pageFeatures: newFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
    });

    expect(getPageViews()).toHaveLength(9);

    // runs with new config
    await edkt.run({
      pageFeatures: newFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
      featureStorageSize: 3,
    });

    const edktPageViews = getPageViews();

    expect(edktPageViews).toHaveLength(3);
    expect(edktPageViews).toEqual([
      {
        features: newFeatures,
        ts: edktPageViews[0].ts,
      },
      {
        features: newFeatures,
        ts: Math.round(newerDate / 1000),
      },
      {
        features: oldFeatures,
        ts: Math.round(new Date('2000-12-08T09:00:00.333Z').valueOf() / 1000),
      },
    ]);
  });

  it('should trim pageViews beyond limit while accepting new entries', async () => {
    for (let i = 1; i < 9; i++) {
      await edkt.run({
        pageFeatures: oldFeatures,
        audienceDefinitions: [],
        omitGdprConsent,
        vendorIds,
        featureStorageSize: 5,
      });
    }

    expect(getPageViews()).toHaveLength(5);

    await edkt.run({
      pageFeatures: newFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
      featureStorageSize: 6,
    });

    const pageViews = getPageViews();
    expect(pageViews).toHaveLength(6);
  });
});
