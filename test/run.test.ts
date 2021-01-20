import { edkt } from '../src';
import { timeStampInSecs } from '../src/utils';
import {
  clearStore,
  makePageViews,
  getPageViews,
  getMatchedAudiences,
  setUpLocalStorage,
} from './helpers/localStorageSetup';
import {
  makeAudienceDefinition,
  makeStringArrayQuery,
  makeVectorDistanceQuery,
  makeCosineSimilarityQuery,
} from './helpers/audienceDefinitions';

describe('edkt run method', () => {
  describe('basic edkt run behaviour', () => {
    const sportPageFeature = {
      keywords: {
        version: 1,
        value: ['sport'],
      },
    };

    const sportAudience = makeAudienceDefinition({
      id: 'sport_id',
      definition: [makeStringArrayQuery(['sport'])],
    });

    const ONE_SPORTS_PAGE_VIEW = makePageViews(timeStampInSecs(), ['sport'], 1);

    const TWO_SPORTS_PAGE_VIEW = makePageViews(timeStampInSecs(), ['sport'], 2);

    it('does add page view to store', async () => {
      setUpLocalStorage(ONE_SPORTS_PAGE_VIEW);

      await edkt.run({
        pageFeatures: sportPageFeature,
        audienceDefinitions: [sportAudience],
        omitGdprConsent: true,
      });

      const edktPageViews = getPageViews();
      const latestKeywords =
        edktPageViews[edktPageViews.length - 1].features.keywords;

      expect(edktPageViews).toHaveLength(ONE_SPORTS_PAGE_VIEW.length + 1);
      expect(latestKeywords).toEqual({ version: 1, value: ['sport'] });
    });

    it('does not match with one sport page view', async () => {
      setUpLocalStorage(ONE_SPORTS_PAGE_VIEW);

      await edkt.run({
        pageFeatures: sportPageFeature,
        audienceDefinitions: [sportAudience],
        omitGdprConsent: true,
      });

      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('does match with two sport page view', async () => {
      setUpLocalStorage(TWO_SPORTS_PAGE_VIEW);

      await edkt.run({
        pageFeatures: sportPageFeature,
        audienceDefinitions: [sportAudience],
        omitGdprConsent: true,
      });

      expect(getMatchedAudiences()).toHaveLength(1);
    });

    it('does not match with misconfigured audience filter / page feature', async () => {
      setUpLocalStorage(TWO_SPORTS_PAGE_VIEW);

      const misconfiguredSportAudience = makeAudienceDefinition({
        id: 'sport_id',
        definition: [
          makeCosineSimilarityQuery({
            threshold: 0.8,
            vector: [1, 1, 1],
          }),
        ],
      });

      await edkt.run({
        pageFeatures: sportPageFeature,
        audienceDefinitions: [misconfiguredSportAudience],
        omitGdprConsent: true,
      });

      expect(getMatchedAudiences()).toHaveLength(0);
    });
  });

  describe('look back edkt run behaviour', () => {
    const lookBackPageFeature = {
      keywords: {
        version: 1,
        value: [''],
      },
    };

    const lookBackAudience = makeAudienceDefinition({
      id: 'look_back_id',
      lookBack: 2,
      definition: [makeStringArrayQuery([''])],
    });

    const LOOK_BACK_PAGE_VIEW = makePageViews(
      timeStampInSecs(),
      [''],
      lookBackAudience.occurrences
    );

    const lookBackInfinityAudience = makeAudienceDefinition({
      id: 'look_back_infinity_id',
      lookBack: 0,
      definition: [makeStringArrayQuery([''])],
    });

    const LOOK_BACK_INFINITY_PAGE_VIEW = makePageViews(
      0,
      [''],
      lookBackInfinityAudience.occurrences
    );

    beforeAll(clearStore);

    it('does match with lookBack set to 0 with two demo page view at any point in the past', async () => {
      setUpLocalStorage(LOOK_BACK_INFINITY_PAGE_VIEW);

      await edkt.run({
        pageFeatures: lookBackPageFeature,
        audienceDefinitions: [lookBackInfinityAudience],
        omitGdprConsent: true,
      });

      const edktMatchedAudiences = getMatchedAudiences();

      expect(edktMatchedAudiences).toHaveLength(1);
      expect(edktMatchedAudiences[0].id).toEqual('look_back_infinity_id');
    });

    it('does match with lookBack set to 2 with two blank page view within look back period', async () => {
      setUpLocalStorage(LOOK_BACK_PAGE_VIEW);

      await edkt.run({
        pageFeatures: lookBackPageFeature,
        audienceDefinitions: [lookBackAudience],
        omitGdprConsent: true,
      });

      const edktMatchedAudiences = getMatchedAudiences();

      expect(edktMatchedAudiences).toHaveLength(1);
      expect(edktMatchedAudiences[0].id).toEqual('look_back_id');
    });

    it('does not match with lookBack set to 2 with two blank page view outside look back period', async () => {
      setUpLocalStorage(LOOK_BACK_INFINITY_PAGE_VIEW);

      await edkt.run({
        pageFeatures: lookBackPageFeature,
        audienceDefinitions: [lookBackAudience],
        omitGdprConsent: true,
      });

      expect(getMatchedAudiences()).toHaveLength(0);
    });
  });

  describe('topic model run behaviour', () => {
    const topicModelPageFeature = {
      topicDist: {
        version: 1,
        value: [0.2, 0.5, 0.1],
      },
    };

    const topicModelAudience = makeAudienceDefinition({
      id: 'topic_model_id',
      lookBack: 2,
      occurrences: 1,
      definition: [
        makeVectorDistanceQuery({
          vector: [0.4, 0.8, 0.3],
          threshold: 0.5,
        }),
      ],
    });

    beforeAll(clearStore);

    it('does not match with one page view', async () => {
      await edkt.run({
        pageFeatures: topicModelPageFeature,
        audienceDefinitions: [topicModelAudience],
        omitGdprConsent: true,
      });

      const edktPageViews = getPageViews();

      expect(edktPageViews).toEqual([
        {
          ts: edktPageViews[0].ts,
          features: topicModelPageFeature,
        },
      ]);
      expect(getMatchedAudiences()).toHaveLength(0);
    });

    it('does match with two page views', async () => {
      await edkt.run({
        pageFeatures: topicModelPageFeature,
        audienceDefinitions: [topicModelAudience],
        omitGdprConsent: true,
      });

      const edktPageViews = getPageViews();
      const edktMatchedAudiences = getMatchedAudiences();

      expect(edktPageViews).toEqual([
        {
          ts: edktPageViews[0].ts,
          features: topicModelPageFeature,
        },
        {
          ts: edktPageViews[1].ts,
          features: topicModelPageFeature,
        },
      ]);
      expect(edktMatchedAudiences).toEqual([
        {
          id: topicModelAudience.id,
          matchedAt: edktMatchedAudiences[0].matchedAt,
          expiresAt: edktMatchedAudiences[0].expiresAt,
          matchedOnCurrentPageView: true,
          version: 1,
        },
      ]);
    });
  });

  const mixedPageFeatures = {
    topicDist: {
      version: 1,
      value: [0.2, 0.5, 0.1],
    },
    keywords: {
      version: 1,
      value: ['dummy'],
    },
  };

  describe('topic model run behaviour with additional audience', () => {
    const topicModelAudience = makeAudienceDefinition({
      id: 'iab-608',
      occurrences: 1,
      definition: [
        makeVectorDistanceQuery({
          threshold: 0.5,
          vector: [0.4, 0.8, 0.3],
        }),
      ],
    });

    const keywordsAudience = makeAudienceDefinition({
      id: 'iab-607',
      occurrences: 1,
      definition: [makeStringArrayQuery(['sport', 'Leeds United A.F.C.'])],
    });

    const run = () =>
      edkt.run({
        pageFeatures: mixedPageFeatures,
        audienceDefinitions: [topicModelAudience, keywordsAudience],
        omitGdprConsent: true,
      });

    beforeAll(clearStore);

    it('does match with two page views', async () => {
      await run();
      await run();

      const edktPageViews = getPageViews();
      const edktMatchedAudiences = getMatchedAudiences();

      expect(edktPageViews).toEqual([
        {
          ts: edktPageViews[0].ts,
          features: mixedPageFeatures,
        },
        {
          ts: edktPageViews[1].ts,
          features: mixedPageFeatures,
        },
      ]);
      expect(edktMatchedAudiences).toEqual([
        {
          id: topicModelAudience.id,
          matchedAt: edktMatchedAudiences[0].matchedAt,
          expiresAt: edktMatchedAudiences[0].expiresAt,
          matchedOnCurrentPageView: true,
          version: 1,
        },
      ]);
    });
  });

  describe('topic model run behaviour with version mismatch', () => {
    const topicModelAudience = makeAudienceDefinition({
      id: 'iab-608',
      occurrences: 1,
      definition: [
        {
          ...makeVectorDistanceQuery({
            threshold: 0.5,
            vector: [0.4, 0.8, 0.3],
          }),
          featureVersion: 2,
        },
      ],
    });

    const keywordsAudience = makeAudienceDefinition({
      id: 'iab-607',
      occurrences: 1,
      definition: [
        {
          ...makeStringArrayQuery(['sport', 'Leeds United A.F.C.']),
          featureVersion: 2,
        },
      ],
    });

    const run = () =>
      edkt.run({
        pageFeatures: mixedPageFeatures,
        audienceDefinitions: [topicModelAudience, keywordsAudience],
        omitGdprConsent: true,
      });

    beforeAll(clearStore);

    it('does not match with two page views since version is mismatched', async () => {
      await run();
      await run();

      const edktPageViews = getPageViews();

      expect(edktPageViews).toEqual([
        {
          ts: edktPageViews[0].ts,
          features: mixedPageFeatures,
        },
        {
          ts: edktPageViews[1].ts,
          features: mixedPageFeatures,
        },
      ]);
      expect(getMatchedAudiences()).toEqual([]);
    });
  });
});
