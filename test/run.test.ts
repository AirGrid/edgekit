import { edkt } from '../src';
import { AudienceDefinition, PageView, PageFeatureResult } from '../types';
import { timeStampInSecs } from 'src/utils';
import { viewStore, matchedAudienceStore } from 'src/store';
import { pageViewCreator } from './helpers/localStorageSetup';

const sportPageFeatureGetter = {
  name: 'keywords',
  func: (): Promise<PageFeatureResult> => {
    return Promise.resolve({
      version: 1,
      value: ['sport'],
    });
  },
};

const lookBackPageFeatureGetter = {
  name: 'keywords',
  func: (): Promise<PageFeatureResult> => {
    return Promise.resolve({
      version: 1,
      value: [''],
    });
  },
};

const topicModelPageFeatureGetter = {
  name: 'topicDist',
  func: (): Promise<PageFeatureResult> => {
    return Promise.resolve({
      version: 1,
      value: [0.2, 0.5, 0.1],
    });
  },
};

const TTL = 10;

const sportAudience: AudienceDefinition = {
  id: 'sport_id',
  name: 'Sport Audience',
  version: 1,
  definition: {
    ttl: TTL,
    lookBack: 10,
    occurrences: 2,
    queryProperty: 'keywords',
    queryFilterComparisonType: 'arrayIntersects',
    queryValue: ['sport'],
  },
};

const lookBackInfinityAudience: AudienceDefinition = {
  id: 'look_back_infinity_id',
  name: 'Look Back Audience',
  version: 1,
  definition: {
    ttl: TTL,
    lookBack: 0,
    occurrences: 2,
    queryProperty: 'keywords',
    queryFilterComparisonType: 'arrayIntersects',
    queryValue: [''],
  },
};

const lookBackAudience: AudienceDefinition = {
  id: 'look_back_id',
  name: 'Look Back Audience',
  version: 1,
  definition: {
    ttl: TTL,
    lookBack: 2,
    occurrences: 2,
    queryProperty: 'keywords',
    queryFilterComparisonType: 'arrayIntersects',
    queryValue: [''],
  },
};

const topicModelAudience: AudienceDefinition = {
  id: 'topic_model_id',
  name: 'Look Back Audience',
  version: 1,
  definition: {
    ttl: 100,
    lookBack: 2,
    occurrences: 1,
    queryProperty: 'topicDist',
    queryFilterComparisonType: 'vectorDistance',
    queryValue: {
      vector: [0.4, 0.8, 0.3],
      threshold: 0.5,
    },
  },
};

const ONE_SPORTS_PAGE_VIEW: Array<PageView> = pageViewCreator(
  timeStampInSecs(),
  ['sport'],
  1
);

const TWO_SPORTS_PAGE_VIEW: Array<PageView> = pageViewCreator(
  timeStampInSecs(),
  ['sport'],
  2
);

const LOOK_BACK_INFINITY_PAGE_VIEW: Array<PageView> = pageViewCreator(
  0,
  [''],
  lookBackInfinityAudience.definition.occurrences
);

const LOOK_BACK_PAGE_VIEW: Array<PageView> = pageViewCreator(
  timeStampInSecs(),
  [''],
  lookBackAudience.definition.occurrences
);

const setUpLocalStorage = (pageViews: Array<PageView>) => {
  localStorage.clear();
  localStorage.setItem('edkt_page_views', JSON.stringify(pageViews));
  //We need to reload from local storage because its only done on construction
  viewStore._load();
  matchedAudienceStore._load();
};

describe('Test basic edkt run', () => {
  it('does not match with one sport page view', async () => {
    setUpLocalStorage(ONE_SPORTS_PAGE_VIEW);

    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportAudience],
      omitGdprConsent: true,
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews.length).toEqual(ONE_SPORTS_PAGE_VIEW.length + 1);
    const latestKeywords =
      edktPageViews[edktPageViews.length - 1].features.keywords;
    expect(latestKeywords).toEqual({ version: 1, value: ['sport'] });
    expect(edktMatchedAudiences.length).toEqual(0);
  });

  it('does match with two sport page view', async () => {
    setUpLocalStorage(TWO_SPORTS_PAGE_VIEW);

    await edkt.run({
      pageFeatureGetters: [sportPageFeatureGetter],
      audienceDefinitions: [sportAudience],
      omitGdprConsent: true,
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    // The default audience condition matches on (>=) -- see engine/translate.ts
    expect(edktPageViews.length).toBeGreaterThan(
      sportAudience.definition.occurrences
    );

    const latestKeywords =
      edktPageViews[edktPageViews.length - 1].features.keywords;
    expect(latestKeywords).toEqual({ version: 1, value: ['sport'] });
    expect(edktMatchedAudiences.length).toEqual(1);
  });
});

describe('Test look back edkt run', () => {
  it('does match with lookBack set to 0 with two demo page view at any point in the past', async () => {
    setUpLocalStorage(LOOK_BACK_INFINITY_PAGE_VIEW);

    await edkt.run({
      pageFeatureGetters: [lookBackPageFeatureGetter],
      audienceDefinitions: [lookBackInfinityAudience],
      omitGdprConsent: true,
    });

    const edktMatchedAudiences = edkt.getMatchedAudiences();
    expect(edktMatchedAudiences.length).toEqual(1);
    expect(edktMatchedAudiences[0].id).toEqual('look_back_infinity_id');
  });

  it('does match with lookBack set to 2 with two blank page view within look back period', async () => {
    setUpLocalStorage(LOOK_BACK_PAGE_VIEW);

    await edkt.run({
      pageFeatureGetters: [lookBackPageFeatureGetter],
      audienceDefinitions: [lookBackAudience],
      omitGdprConsent: true,
    });

    const edktMatchedAudiences = edkt.getMatchedAudiences();
    expect(edktMatchedAudiences.length).toEqual(1);
    expect(edktMatchedAudiences[0].id).toEqual('look_back_id');
  });

  it('does not match with lookBack set to 2 with two blank page view outside look back period', async () => {
    setUpLocalStorage(LOOK_BACK_INFINITY_PAGE_VIEW);

    await edkt.run({
      pageFeatureGetters: [lookBackPageFeatureGetter],
      audienceDefinitions: [lookBackAudience],
      omitGdprConsent: true,
    });

    const edktMatchedAudiences = edkt.getMatchedAudiences();
    expect(edktMatchedAudiences.length).toEqual(0);
  });
});

describe('Topic model run', () => {
  beforeAll(() => {
    setUpLocalStorage([]);
  });

  it('does not match with one page view', async () => {
    await edkt.run({
      pageFeatureGetters: [topicModelPageFeatureGetter],
      audienceDefinitions: [topicModelAudience],
      omitGdprConsent: true,
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews).toEqual([
      {
        ts: edktPageViews[0].ts,
        features: {
          topicDist: {
            version: 1,
            value: [0.2, 0.5, 0.1],
          },
        },
      },
    ]);

    expect(edktMatchedAudiences.length).toEqual(0);
  });

  it('does match with two page views', async () => {
    await edkt.run({
      pageFeatureGetters: [topicModelPageFeatureGetter],
      audienceDefinitions: [topicModelAudience],
      omitGdprConsent: true,
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews).toEqual([
      {
        ts: edktPageViews[0].ts,
        features: {
          topicDist: {
            version: 1,
            value: [0.2, 0.5, 0.1],
          },
        },
      },
      {
        ts: edktPageViews[1].ts,
        features: {
          topicDist: {
            version: 1,
            value: [0.2, 0.5, 0.1],
          },
        },
      },
    ]);

    // The default audience condition matches on (>=) -- see engine/translate.ts
    expect(edktPageViews.length).toBeGreaterThan(
      topicModelAudience.definition.occurrences
    );
    expect(edktMatchedAudiences).toEqual([
      {
        id: topicModelAudience.id,
        matchedAt: edktMatchedAudiences[0].matchedAt,
        expiresAt: edktMatchedAudiences[0].expiresAt,
        matchedOnCurrentPageView: true,
        matched: true,
      },
    ]);
  });
});

describe('Topic model run 2', () => {
  const topicModelAudience: AudienceDefinition = {
    id: 'iab-608',
    name: 'Interest | Sport',
    version: 1,
    definition: {
      occurrences: 1,
      ttl: 1000,
      lookBack: 1000,
      queryProperty: 'topicDist',
      queryFilterComparisonType: 'vectorDistance',
      queryValue: {
        threshold: 0.5,
        vector: [0.4, 0.8, 0.3],
      },
    },
  };

  const keywordsAudience: AudienceDefinition = {
    id: 'iab-607',
    name: 'Interest | Sport',
    version: 1,
    definition: {
      occurrences: 1,
      ttl: 1000,
      lookBack: 1000,
      queryProperty: 'keywords',
      queryFilterComparisonType: 'arrayIntersects',
      queryValue: ['sport', 'Leeds United A.F.C.'],
    },
  };

  const run = async () => {
    await edkt.run({
      pageFeatureGetters: [
        topicModelPageFeatureGetter,
        {
          name: 'keywords',
          func: (): Promise<PageFeatureResult> => {
            return Promise.resolve({
              version: 1,
              value: ['dummy'],
            });
          },
        },
      ],
      audienceDefinitions: [topicModelAudience, keywordsAudience],
      omitGdprConsent: true,
    });
  };

  beforeAll(() => {
    setUpLocalStorage([]);
  });

  it('does match with two page views', async () => {
    await run();
    await run();

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktPageViews).toEqual([
      {
        ts: edktPageViews[0].ts,
        features: {
          keywords: {
            version: 1,
            value: ['dummy'],
          },
          topicDist: {
            version: 1,
            value: [0.2, 0.5, 0.1],
          },
        },
      },
      {
        ts: edktPageViews[1].ts,
        features: {
          keywords: {
            version: 1,
            value: ['dummy'],
          },
          topicDist: {
            version: 1,
            value: [0.2, 0.5, 0.1],
          },
        },
      },
    ]);

    // The default audience condition matches on (>=) -- see engine/translate.ts
    expect(edktPageViews.length).toBeGreaterThan(
      topicModelAudience.definition.occurrences
    );
    expect(edktMatchedAudiences).toEqual([
      {
        id: topicModelAudience.id,
        matchedAt: edktMatchedAudiences[0].matchedAt,
        expiresAt: edktMatchedAudiences[0].expiresAt,
        matchedOnCurrentPageView: true,
        matched: true,
      },
    ]);
  });
});
