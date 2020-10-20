import { edkt } from '../src';
import { checkForConsent } from '../src/gdpr';
import { /*TCData,*/ AudienceDefinition, PageFeatureResult } from '../types';

const TTL = 10;
const airgridVendorId = 782;
let consents = { [airgridVendorId]: false };
let gdprApplies: boolean | undefined;

const injectTcfApi = () => {
  window.__tcfapi = (
    command: string,
    _: number,
    // TODO: fix function overloading
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cb: any // (tcData: TCData, success: boolean) => void
  ) => {
    if (command === 'addEventListener') {
      cb(
        {
          gdprApplies,
          eventStatus: 'tcloaded',
          vendor: { consents: consents },
        },
        true
      );
    }
  };
};

const sportAudience: AudienceDefinition = {
  id: 'sport_id',
  name: 'Sport Audience',
  version: 1,
  definition: {
    featureVersion: 1,
    ttl: TTL,
    lookBack: 10,
    occurrences: 0,
    queryProperty: 'keywords',
    queryFilterComparisonType: 'arrayIntersects',
    queryValue: ['sport'],
  },
};

const sportPageFeatureGetter = {
  name: 'keywords',
  func: (): Promise<PageFeatureResult> => {
    return Promise.resolve({
      version: 1,
      value: ['sport'],
    });
  },
};

describe.only('EdgeKit GDPR tests', () => {
  describe('checkForConsent', () => {
    it('should fail to consent if the Transparency and Consent Framework API is missing', async () => {
      expect(window.__tcfapi).toBeUndefined();
      const hasConsent = await checkForConsent([airgridVendorId]);
      expect(hasConsent).toBe(false);
    });

    it('should fail to consent if the api is there but gdprApplies is undefined', async () => {
      injectTcfApi();

      expect(window.__tcfapi).not.toBeUndefined();
      expect(await checkForConsent([airgridVendorId])).toBe(false);
    });

    it(`should not consent if GDPR applies but the vendor does't consent`, async () => {
      gdprApplies = true;
      expect(consents[airgridVendorId]).toBe(false);
      expect(await checkForConsent([airgridVendorId])).toBe(false);
    });

    it('should consent if GDPR applies and the vender consents', async () => {
      consents = { [airgridVendorId]: true };
      expect(window.__tcfapi).not.toBeUndefined();
      expect(await checkForConsent([airgridVendorId])).toBe(true);
    });
  });

  describe('run', () => {
    // TODO
    it.skip('should not run edgekit if there is no GDPR consent', async () => {
      consents = { [airgridVendorId]: false };

      await edkt.run({
        pageFeatureGetters: [sportPageFeatureGetter],
        audienceDefinitions: [sportAudience],
        vendorIds: [airgridVendorId],
        allowMultipleRuns: true,
      });

      const edktPageViews = JSON.parse(
        localStorage.getItem('edkt_page_views') || '[]'
      );

      const edktMatchedAudiences = JSON.parse(
        localStorage.getItem('edkt_matched_audiences') || '[]'
      );

      expect(edktPageViews).toHaveLength(0);
      expect(edktMatchedAudiences).toHaveLength(0);
    });

    it('should run edgekit if there is GDPR consent', async () => {
      consents = { [airgridVendorId]: true };

      await edkt.run({
        pageFeatureGetters: [sportPageFeatureGetter],
        audienceDefinitions: [sportAudience],
        vendorIds: [airgridVendorId],
        allowMultipleRuns: true,
      });

      const edktPageViews = JSON.parse(
        localStorage.getItem('edkt_page_views') || '[]'
      );

      const edktMatchedAudiences = JSON.parse(
        localStorage.getItem('edkt_matched_audiences') || '[]'
      );

      expect(edktPageViews).toHaveLength(1);
      expect(edktPageViews).toEqual([
        {
          ts: edktPageViews[0].ts,
          features: {
            keywords: {
              version: 1,
              value: ['sport'],
            },
          },
        },
      ]);

      expect(edktMatchedAudiences).toEqual([
        {
          id: 'sport_id',
          matched: true,
          matchedOnCurrentPageView: true,
          ...edktMatchedAudiences[0],
        },
      ]);
    });
  });
});
