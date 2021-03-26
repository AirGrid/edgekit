import { edkt } from '../../src';
import {
  checkConsentStatus,
  waitForTcfApiTimeout,
  runOnConsent,
} from '../../src/gdpr';
import { TCData } from '../../types';
import {
  makeAudienceDefinition,
  makeLogisticRegressionQuery,
} from '../helpers/audienceDefinitions';
import { getPageViews, getMatchedAudiences } from '../helpers/localStorage';

describe('EdgeKit GDPR tests', () => {
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
      }, 200);
    });
  };

  const featureVector = [1, 1, 1];

  const audienceDefinition = makeAudienceDefinition({
    id: 'audience_id',
    lookBack: 10,
    occurrences: 0,
    definition: [
      makeLogisticRegressionQuery({
        queryValue: {
          vector: featureVector,
          bias: 0,
          threshold: 0.9,
        },
      }),
    ],
  });

  const pageFeatures = {
    docVector: {
      version: 1,
      value: featureVector,
    },
  };

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
            pageFeatures: pageFeatures,
            audienceDefinitions: [audienceDefinition],
            vendorIds: [airgridVendorId],
          });
          return process.hrtime();
        })(),
        updateTCDataAfterDelay(),
      ]);

      const edktPageViews = getPageViews();
      const edktMatchedAudiences = getMatchedAudiences();

      expect(runMsecs).toBeGreaterThanOrEqual(updateMsecs);
      expect(runNsecs).toBeGreaterThanOrEqual(updateNsecs);

      expect(edktPageViews).toHaveLength(1);
      expect(edktPageViews).toEqual([
        {
          ts: edktPageViews[0].ts,
          features: pageFeatures,
        },
      ]);

      expect(edktMatchedAudiences).toEqual([
        {
          ...edktMatchedAudiences[0],
          id: 'audience_id',
          matchedOnCurrentPageView: true,
        },
      ]);
    });
  });

  describe('runOnConsent behaviour', () => {
    it('should not run callback until there is GDPR consent', async () => {
      updateTCData({
        eventStatus: 'cmpuishown',
        vendor: { consents: { [airgridVendorId]: false } },
      });

      let success = false;
      const callback = () => {
        success = true;
        return new Promise((resolve) => resolve());
      };

      const [
        [runMsecs, runNsecs],
        [updateMsecs, updateNsecs],
      ] = await Promise.all([
        (async () => {
          await runOnConsent([airgridVendorId], callback);
          return process.hrtime();
        })(),
        updateTCDataAfterDelay(),
      ]);

      expect(runMsecs).toBeGreaterThanOrEqual(updateMsecs);
      expect(runNsecs).toBeGreaterThanOrEqual(updateNsecs);

      expect(success).toEqual(true);
    });

    // TODO @naripok test no consent (run forever) case
  });
});
