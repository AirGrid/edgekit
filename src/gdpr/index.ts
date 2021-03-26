import { TCData, ConsentStatus } from '../../types';
import { timeout } from '../utils';

export const waitForTcfApiTimeout = 10 * 1000;

const hasGdprConsent = (vendorIds: number[], tcData: TCData): boolean => {
  const { vendor } = tcData;
  return (
    !!vendor &&
    vendorIds.length > 0 &&
    vendorIds.every((vendorId) => !!vendor.consents[vendorId])
  );
};

const removeListener = (tcData: TCData): Promise<boolean> => {
  return new Promise((resolve) => {
    if (tcData.listenerId) {
      window.__tcfapi(
        'removeEventListener',
        2,
        (success) => resolve(success),
        tcData.listenerId
      );
    }
  });
};

const waitForTcfApi = () => {
  return Promise.race([
    new Promise((resolve) => {
      let intervalId: number | null = null;
      intervalId = window.setInterval(() => {
        if (!!window.__tcfapi) {
          if (!!intervalId) {
            window.clearInterval(intervalId);
          }
          resolve();
        }
      }, 100);
    }),
    timeout(waitForTcfApiTimeout, 'TCF API is missing'),
  ]);
};

export const checkConsentStatus = async (
  vendorIds: number[] = []
): Promise<ConsentStatus> => {
  await waitForTcfApi();
  return new Promise((resolve, reject) => {
    const callback = (tcData: TCData, success: boolean): void => {
      const { cmpStatus } = tcData;
      if (success && cmpStatus === 'loaded') {
        const hasConsent = hasGdprConsent(vendorIds, tcData);
        const { eventStatus } = tcData;
        resolve({ eventStatus, hasConsent });
        removeListener(tcData);
      }
    };

    if (!window.__tcfapi) reject(new Error('TCF API is missing'));
    try {
      window.__tcfapi('addEventListener', 2, callback);
    } catch (err) {
      reject(err);
    }
  });
};

export const waitForConsent = async (
  vendorIds: number[] = []
): Promise<boolean> => {
  await waitForTcfApi();
  return new Promise((resolve, reject) => {
    const callback = (tcData: TCData, success: boolean): void => {
      const { cmpStatus } = tcData;
      if (
        success &&
        cmpStatus === 'loaded' &&
        (tcData.eventStatus === 'tcloaded' ||
          tcData.eventStatus === 'useractioncomplete')
      ) {
        resolve(hasGdprConsent(vendorIds, tcData));
        removeListener(tcData);
      }
    };

    if (window.__tcfapi) {
      window.__tcfapi('addEventListener', 2, callback);
    } else {
      reject(new Error('TCF API is missing'));
    }
  });
};

export const runOnConsent = async <T>(
  vendorIds: number[],
  callback: () => Promise<T>,
  omitGdprConsent = false
): Promise<T> => {
  let hasConsent = true;
  if (!omitGdprConsent) {
    hasConsent = await waitForConsent(vendorIds);
  }
  if (!hasConsent) throw new Error('No Gdpr consent given');
  const result = await callback();
  return result;
};
