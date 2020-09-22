import { edkt } from '../src';
import { hasGdprConsent } from '../src/gdpr';
import { TCData, AudienceDefinition } from '../types';

const TTL = 10;
const airgridVendorId = 782;
let consents = { [airgridVendorId]: false };
let gdprApplies: boolean | undefined;

const injectTcfApi = () => {
  window.__tcfapi = (
    command: string,
    _: number,
    cb: (tcData: TCData, success: boolean) => void
  ) => {
    if (command === 'getTCData') {
      cb({ gdprApplies, vendor: { consents: consents } }, true);
    }
  };
};

const sportAudience: AudienceDefinition = {
  id: 'sport_id',
  name: 'Sport Audience',
  ttl: TTL,
  lookBack: 10,
  occurrences: 0,
  version: 1,
  queryProperty: 'keywords',
  queryFilterComparisonType: 'includes',
  queryValue: ['sport'],
};

const sportPageFeatureGetter = {
  name: 'keywords',
  func: (): Promise<string[]> => {
    return Promise.resolve(['sport']);
  },
};

describe.only('EdgeKit GDPR tests', () => {
  describe('hasGdprConsent', () => {
    it('should fail to consent if the Transparency and Consent Framework API is missing', async () => {
      expect(window.__tcfapi).toBeUndefined();
      const hasConsent = await hasGdprConsent([airgridVendorId]);
      expect(hasConsent).toBe(false);
    });

    it('should fail to consent if the api is there but gdprApplies is undefined or false', async () => {
      injectTcfApi();

      expect(window.__tcfapi).not.toBeUndefined();
      expect(await hasGdprConsent([airgridVendorId])).toBe(false);

      gdprApplies = false;
      expect(await hasGdprConsent([airgridVendorId])).toBe(false);
    });

    it(`should not consent if GDPR applies but the vendor does't consent`, async () => {
      gdprApplies = true;
      expect(consents[airgridVendorId]).toBe(false);
      expect(await hasGdprConsent([airgridVendorId])).toBe(false);
    });

    it('should consent if GDPR applies and the vender consents', async () => {
      consents = { [airgridVendorId]: true };
      expect(window.__tcfapi).not.toBeUndefined();
      expect(await hasGdprConsent([airgridVendorId])).toBe(true);
    });
  });

  describe('run', () => {
    it('should not run edgekit if there is no GDPR consent', async () => {
      consents = { [airgridVendorId]: false };
      await edkt.run({
        pageFeatureGetters: [sportPageFeatureGetter],
        audienceDefinitions: [sportAudience],
        vendorIds: [airgridVendorId],
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
      });

      const edktPageViews = JSON.parse(
        localStorage.getItem('edkt_page_views') || '[]'
      );

      const edktMatchedAudiences = JSON.parse(
        localStorage.getItem('edkt_matched_audiences') || '[]'
      );

      expect(edktPageViews).toHaveLength(1);
      expect(edktPageViews).toEqual([
        { features: { keywords: ['sport'] }, ts: edktPageViews[0].ts },
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
