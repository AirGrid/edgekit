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

  it('should delete old pageView entries beyond maxAge on new config value', async () => {
    // Defaults to Infinity for now...
    // viewStore.setMaxAge(1000000000000000)

    // Stub Date object
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('1982-09-01T09:00:00.333Z').valueOf()
      );

    // runs fist time in 1982
    await edkt.run({
      pageFeatures: oldFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
    });

    expect(getPageViews()).toHaveLength(1);

    // time has passed...

    // run second time with current timestamp
    await edkt.run({
      pageFeatures: newFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
    });

    expect(getPageViews()).toHaveLength(2);

    // run third time with new config
    await edkt.run({
      pageFeatures: newFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
      featureMaxAge: 3600 * 24 * 60,
    });

    expect(getPageViews()).toHaveLength(2);

    const edktPageViews = getPageViews();
    expect(edktPageViews).toEqual([
      {
        features: newFeatures,
        ts: edktPageViews[0].ts,
      },
      {
        features: newFeatures,
        ts: edktPageViews[1].ts,
      },
    ]);
  });

  it('should delete old pageView entries beyond maxStorageSize', async () => {
    for (let i = 1; i < 9; i++) {
      // Stub Date object
      jest
        .spyOn(global.Date, 'now')
        .mockImplementationOnce(() =>
          new Date(`2020-12-0${i}T09:00:00.333Z`).valueOf()
        );
      await edkt.run({
        pageFeatures: oldFeatures,
        audienceDefinitions: [],
        omitGdprConsent,
        vendorIds,
      });
    }

    expect(getPageViews()).toHaveLength(8);

    // runs with current timestamp
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
        ts: edktPageViews[1].ts,
      },
      {
        features: oldFeatures,
        ts: Math.round(new Date('2020-12-08T09:00:00.333Z').valueOf() / 1000),
      },
    ]);
  });

  it('should trim pageViews beyond limit while accepting new entries', async () => {
    for (let i = 1; i < 9; i++) {
      // Stub Date object
      jest
        .spyOn(global.Date, 'now')
        .mockImplementationOnce(() =>
          new Date(`2020-12-0${i}T09:00:00.333Z`).valueOf()
        );
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

    expect(getPageViews()).toHaveLength(6);
  });

  it('should reject entries containing ts beyond maxAge and should keep last config value', async () => {
    // Stub Date object
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date(`1978-12-01T09:00:00.333Z`).valueOf()
      );
    await edkt.run({
      pageFeatures: oldFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
      featureMaxAge: 3600 * 24,
    });

    expect(getPageViews()).toHaveLength(0);

    await edkt.run({
      pageFeatures: newFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
    });

    expect(getPageViews()).toHaveLength(1);

    // Stub Date object
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date(`1978-12-01T09:00:00.333Z`).valueOf()
      );
    await edkt.run({
      pageFeatures: oldFeatures,
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
    });

    expect(getPageViews()).toHaveLength(1);
  });
});
