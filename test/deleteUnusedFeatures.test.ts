import { viewStore } from '../src/store';
import { edkt } from '../src';
import { getPageViews } from './helpers/localStorageSetup';

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

  it('should delete old pageView entries beyond maxAge', async () => {

    // Stub Date object
    jest.spyOn(global.Date, 'now')
    .mockImplementationOnce(
      () => new Date('1982-09-01T09:00:00.333Z').valueOf()
    )

    // runs fist time in 1982
    await edkt.run({
      pageFeatures: oldFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
    });

    expect(getPageViews()).toHaveLength(1)

    // time has passed...

    // run second time with current timestamp
    await edkt.run({
      pageFeatures: newFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
    });

    expect(getPageViews()).toHaveLength(2)

    // the module is loaded again
    viewStore.setMaxAge(3600 * 24 * 60)

    const edktPageViews = getPageViews();

    expect(edktPageViews).toEqual([
      {
        features: newFeatures,
        ts: edktPageViews[0].ts,
      },
    ]);
  });

  it('should delete old pageView entries beyond maxStorageSize', async () => {

    for (let i = 1; i < 9; i++) {
      // Stub Date object
      jest.spyOn(global.Date, 'now')
      .mockImplementationOnce(
        () => new Date(`2020-12-0${i}T09:00:00.333Z`).valueOf()
      )
      // runs fist time in 1982
      await edkt.run({
        pageFeatures: oldFeatures,
        audienceDefinitions: [],
        omitGdprConsent,
        vendorIds,
      });
    }

    expect(getPageViews()).toHaveLength(8)

    // run second time with current timestamp
    await edkt.run({
      pageFeatures: newFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
    });

    expect(getPageViews()).toHaveLength(9)

    // change module config
    viewStore.setStoreSize(3)

    const edktPageViews = getPageViews();

    expect(edktPageViews).toHaveLength(3)
    expect(edktPageViews).toEqual([
      {
        features: newFeatures,
        ts: edktPageViews[0].ts,
      },
      {
        features: oldFeatures,
        ts: Math.round(new Date('2020-12-08T09:00:00.333Z').valueOf() / 1000),
      },
      {
        features: oldFeatures,
        ts: Math.round(new Date('2020-12-07T09:00:00.333Z').valueOf() / 1000),
      },
    ]);
  });
});
