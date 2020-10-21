import { TCData, ConsentStatus } from '../../types';

const hasGdprConsent = (vendorIds: number[], tcData: TCData): boolean => {
  const { gdprApplies, vendor } = tcData;
  return (
    gdprApplies === false ||
    (vendorIds.length > 0 &&
      vendorIds.every((vendorId) => !!vendor.consents[vendorId]))
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

export const checkConsentStatus = (
  vendorIds: number[] = []
): Promise<ConsentStatus> => {
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

    if (window.__tcfapi) {
      window.__tcfapi('addEventListener', 2, callback);
    } else {
      reject(new Error('TCF API is missing'));
    }
  });
};

// This promise will only resolve once there is gdpr consent at that point in time
export const waitForConsent = (vendorIds: number[] = []): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const callback = (tcData: TCData, success: boolean): void => {
      if (
        success &&
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
  if (!omitGdprConsent) {
    await waitForConsent(vendorIds);
  }
  const result = await callback();
  return result;
};
