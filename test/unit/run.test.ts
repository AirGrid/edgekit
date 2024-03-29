import { edkt } from '../../src';
import { timeStampInSecs } from '../../src/utils';
import { clearStore, setUpLocalStorage } from '../helpers/localStorage';
import {
  makeAudienceDefinition,
  makeCosineSimilarityQuery,
  makeLogisticRegressionQuery,
} from '../helpers/audienceDefinitions';
import { PageView } from '../../types';

describe('edkt run method', () => {
  const MATCHING_VECTOR = [1, 1, 1];

  const makePageViews = (
    timestamp: number,
    pageViewFeatures: PageView['features'],
    numberOfPageViews: number
  ): PageView[] => {
    return Array.from({ length: numberOfPageViews }).map(() => ({
      ts: timestamp,
      features: {
        ...pageViewFeatures,
      },
    }));
  };

  const pageFeatures = {
    docVector: {
      version: 1,
      value: MATCHING_VECTOR,
    },
  };

  describe('basic edkt run behaviour', () => {
    const audienceDefinition = makeAudienceDefinition({
      id: 'sport_id',
      definition: [
        makeCosineSimilarityQuery({
          queryValue: {
            threshold: 0.99,
            vector: MATCHING_VECTOR,
          },
          queryProperty: 'docVector',
        }),
      ],
    });

    const ONE_PAGE_VIEW = makePageViews(timeStampInSecs(), pageFeatures, 1);

    const TWO_PAGE_VIEW = makePageViews(timeStampInSecs(), pageFeatures, 2);

    it('does add page view to store', async () => {
      setUpLocalStorage(ONE_PAGE_VIEW);

      await edkt.run({
        pageFeatures,
        audienceDefinitions: [audienceDefinition],
        omitGdprConsent: true,
      });

      const edktPageViews = edkt.getCopyOfPageViews();
      const latestQueryFeature =
        edktPageViews[edktPageViews.length - 1].features;

      expect(edktPageViews).toHaveLength(ONE_PAGE_VIEW.length + 1);
      expect(latestQueryFeature).toHaveProperty(
        'docVector',
        pageFeatures.docVector
      );
    });

    it('does not match with sport page view', async () => {
      setUpLocalStorage(ONE_PAGE_VIEW);

      await edkt.run({
        pageFeatures,
        audienceDefinitions: [audienceDefinition],
        omitGdprConsent: true,
      });

      expect(edkt.getMatchedAudiences()).toHaveLength(0);
    });

    it('does match with two page view', async () => {
      setUpLocalStorage(TWO_PAGE_VIEW);

      await edkt.run({
        pageFeatures,
        audienceDefinitions: [audienceDefinition],
        omitGdprConsent: true,
      });

      expect(edkt.getMatchedAudiences()).toHaveLength(1);
    });

    it('does not match with misconfigured audience filter / page feature', async () => {
      setUpLocalStorage(TWO_PAGE_VIEW);

      const misconfiguredSportAudience = makeAudienceDefinition({
        id: 'sport_id',
        definition: [
          makeCosineSimilarityQuery({
            queryValue: {
              threshold: 0.9,
              vector: MATCHING_VECTOR,
            },
            queryProperty: 'misconfiguredProperty',
          }),
        ],
      });

      await edkt.run({
        pageFeatures,
        audienceDefinitions: [misconfiguredSportAudience],
        omitGdprConsent: true,
      });

      expect(edkt.getMatchedAudiences()).toHaveLength(0);
    });

    it('does not break execution if there is a malformed audience definition', async () => {
      setUpLocalStorage(TWO_PAGE_VIEW);

      const malformedAudience = {
        id: 'test_id',
        version: 7,
        ttl: 1209600,
        lookBack: 0,
        occurrences: 0,
      };

      await edkt.run({
        pageFeatures,
        audienceDefinitions: [
          audienceDefinition,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          malformedAudience,
        ],
        omitGdprConsent: true,
      });

      expect(edkt.getMatchedAudiences()).toHaveLength(1);
    });
  });

  describe('look back edkt run behaviour', () => {
    const lookBackPageFeature = {
      docVector: {
        version: 1,
        value: MATCHING_VECTOR,
      },
    };

    const lookBackAudience = makeAudienceDefinition({
      id: 'look_back_id',
      lookBack: 2,
      definition: [
        makeCosineSimilarityQuery({
          queryValue: {
            vector: MATCHING_VECTOR,
            threshold: 0.99,
          },
          queryProperty: 'docVector',
        }),
      ],
    });

    const lookBackPageView = makePageViews(
      timeStampInSecs(),
      pageFeatures,
      lookBackAudience.occurrences
    );

    const lookBackInfinityAudience = makeAudienceDefinition({
      id: 'look_back_infinity_id',
      lookBack: 0,
      definition: [
        makeCosineSimilarityQuery({
          queryValue: {
            threshold: 0.99,
            vector: MATCHING_VECTOR,
          },
          queryProperty: 'docVector',
        }),
      ],
    });

    const lookBackInfinityPageView = makePageViews(
      0,
      pageFeatures,
      lookBackInfinityAudience.occurrences
    );

    beforeAll(clearStore);

    it('does match with lookBack set to 0 with two demo page view at any point in the past', async () => {
      setUpLocalStorage(lookBackInfinityPageView);

      await edkt.run({
        pageFeatures: lookBackPageFeature,
        audienceDefinitions: [lookBackInfinityAudience],
        omitGdprConsent: true,
      });

      const edktMatchedAudiences = edkt.getMatchedAudiences();

      expect(edktMatchedAudiences).toHaveLength(1);
      expect(edktMatchedAudiences[0].id).toEqual('look_back_infinity_id');
    });

    it('does match with lookBack set to 2 with two blank page view within look back period', async () => {
      setUpLocalStorage(lookBackPageView);

      await edkt.run({
        pageFeatures: lookBackPageFeature,
        audienceDefinitions: [lookBackAudience],
        omitGdprConsent: true,
      });

      const edktMatchedAudiences = edkt.getMatchedAudiences();

      expect(edktMatchedAudiences).toHaveLength(1);
      expect(edktMatchedAudiences[0].id).toEqual('look_back_id');
    });

    it('does not match with lookBack set to 2 with two blank page view outside look back period', async () => {
      setUpLocalStorage(lookBackInfinityPageView);

      await edkt.run({
        pageFeatures: lookBackPageFeature,
        audienceDefinitions: [lookBackAudience],
        omitGdprConsent: true,
      });

      expect(edkt.getMatchedAudiences()).toHaveLength(0);
    });
  });

  describe('run behaviour with version mismatch', () => {
    const cosSimAudience = makeAudienceDefinition({
      id: 'cosSim_id',
      occurrences: 1,
      definition: [
        makeCosineSimilarityQuery({
          queryValue: {
            threshold: 0.99,
            vector: MATCHING_VECTOR,
          },
          queryProperty: 'docVector',
          featureVersion: 2,
        }),
      ],
    });

    const logRegAudience = makeAudienceDefinition({
      id: 'logReg_id',
      occurrences: 1,
      definition: [
        makeLogisticRegressionQuery({
          queryValue: {
            threshold: 0.99,
            vector: MATCHING_VECTOR,
            bias: 0,
          },
          queryProperty: 'docVector',
          featureVersion: 2,
        }),
      ],
    });

    const run = () =>
      edkt.run({
        pageFeatures,
        audienceDefinitions: [cosSimAudience, logRegAudience],
        omitGdprConsent: true,
      });

    beforeAll(clearStore);

    it('does not match with two page views since version is mismatched', async () => {
      await run();
      await run();

      const edktPageViews = edkt.getCopyOfPageViews();

      expect(edktPageViews).toEqual([
        {
          ts: edktPageViews[0].ts,
          features: pageFeatures,
        },
        {
          ts: edktPageViews[1].ts,
          features: pageFeatures,
        },
      ]);
      expect(edkt.getMatchedAudiences()).toEqual([]);
    });
  });
});
