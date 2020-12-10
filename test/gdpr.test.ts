import { edkt } from '../src';
import { checkConsentStatus, waitForTcfApiTimeout } from '../src/gdpr';
import { TCData, AudienceDefinition, QueryFilterComparisonType } from '../types';

const airgridVendorId = 782;

let TCData: TCData = {
  cmpStatus: 'loaded',
  eventStatus: 'tcloaded',
  gdprApplies: true,
  vendor: { consents: { [airgridVendorId]: false } },
};

let nextListenerId = 0;
let callbacks: {
  listenerId: number;
  cb: (tcData: TCData, success: boolean) => void;
}[] = [];

const updateTCData = (newTCData: {
  eventStatus?: 'tcloaded' | 'cmpuishown' | 'useractioncomplete';
  vendor?: { consents: { [vendorId: number]: boolean | undefined } };
  gdprApplies?: boolean;
}) => {
  TCData = {
    ...TCData,
    ...newTCData,
  };

  callbacks.forEach(({ listenerId, cb }) => {
    cb(
      {
        ...TCData,
        listenerId,
      },
      true
    );
  });
};

function __tcfapi(
  command: 'addEventListener',
  version: number,
  cb: (tcData: TCData, success: boolean) => void
): void;

function __tcfapi(
  command: 'removeEventListener',
  _: number,
  cb: (success: boolean) => void
): void;

// TODO: Jest doesn't recognize function overloading
function __tcfapi(
  command: 'addEventListener' | 'removeEventListener',
  _: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cb: any,
  listenerId?: number
) {
  if (command === 'addEventListener') {
    const callback = { cb, listenerId: nextListenerId++ };
    callbacks.push(callback);
    updateTCData({});
  } else if (command === 'removeEventListener' && listenerId) {
    callbacks = callbacks.filter((cb) => cb.listenerId !== listenerId);
  }
}

const injectTcfApi = () => {
  window.__tcfapi = __tcfapi;
};

const updateTCDataAfterDelay = (): Promise<[number, number]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      updateTCData({
        eventStatus: 'useractioncomplete',
        vendor: { consents: { [airgridVendorId]: true } },
      });
      resolve(process.hrtime());
    }, 500);
  });
};

const sportAudience: AudienceDefinition = {
  id: 'sport_id',
  name: 'Sport Audience',
  version: 1,
  definition: {
    featureVersion: 1,
    ttl: 100,
    lookBack: 10,
    occurrences: 0,
    queryProperty: 'keywords',
    queryFilterComparisonType: QueryFilterComparisonType.ARRAY_INTERSECTS,
    queryValue: ['sport'],
  },
};

const sportPageFeature = {
  keywords: {
    version: 1,
    value: ['sport'],
  },
};

describe.only('EdgeKit GDPR tests', () => {
  describe('checkForConsent', () => {
    it('should fail to consent if the Transparency and Consent Framework API is missing', async () => {
      jest.setTimeout(waitForTcfApiTimeout + 500);
      expect(window.__tcfapi).toBeUndefined();
      await expect(checkConsentStatus([airgridVendorId])).rejects.toThrow(
        'TCF API is missing'
      );
    });

    it('should fail to consent if the api is there but gdprApplies is undefined', async () => {
      injectTcfApi();
      expect(window.__tcfapi).not.toBeUndefined();
      await expect(checkConsentStatus([airgridVendorId])).resolves.toEqual({
        eventStatus: 'tcloaded',
        hasConsent: false,
      });
    });

    it(`should not consent if GDPR applies but the vendor does't consent`, async () => {
      updateTCData({ gdprApplies: true });
      await expect(checkConsentStatus([airgridVendorId])).resolves.toEqual({
        eventStatus: 'tcloaded',
        hasConsent: false,
      });
    });

    it('should consent if GDPR applies and the vender consents', async () => {
      updateTCData({ vendor: { consents: { [airgridVendorId]: true } } });
      expect(window.__tcfapi).not.toBeUndefined();
      await expect(checkConsentStatus([airgridVendorId])).resolves.toEqual({
        eventStatus: 'tcloaded',
        hasConsent: true,
      });
    });
  });

  describe('run', () => {
    it('should not run edgekit until there is GDPR consent', async () => {
      updateTCData({
        eventStatus: 'cmpuishown',
        vendor: { consents: { [airgridVendorId]: false } },
      });

      const [
        [runMsecs, runNsecs],
        [updateMsecs, updateNsecs],
      ] = await Promise.all([
        (async () => {
          await edkt.run({
            pageFeatures: sportPageFeature,
            audienceDefinitions: [sportAudience],
            vendorIds: [airgridVendorId],
          });
          return process.hrtime();
        })(),
        updateTCDataAfterDelay(),
      ]);

      expect(runMsecs).toBeGreaterThanOrEqual(updateMsecs);
      expect(runNsecs).toBeGreaterThanOrEqual(updateNsecs);

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
