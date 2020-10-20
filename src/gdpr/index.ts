import { TCData } from '../../types';

const hasGdprConsent = (vendorIds: number[], tcData: TCData): boolean => {
  const { gdprApplies, vendor } = tcData;
  console.log('HAS GDPR CONSENT', { gdprApplies, vendor });
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

// This promise will only resolve once there is gdpr consent at that point in time
export const waitOnConsent = (
  vendorIds: number[] = [],
  omitGdprConsent = false
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (omitGdprConsent) {
      resolve(true);
      return;
    }

    const callback = (tcData: TCData, success: boolean): void => {
      if (
        success &&
        (tcData.eventStatus === 'tcloaded' ||
          tcData.eventStatus === 'useractioncomplete') &&
        hasGdprConsent(vendorIds, tcData)
      ) {
        resolve(true);
        removeListener(tcData);
      }
    };

    if (window.__tcfapi) {
      window.__tcfapi('addEventListener', 2, callback);
    }
  });
};

export const runOnConsent = async <T>(
  vendorIds: number[],
  callback: () => Promise<T>,
  omitGdprConsent = false
): Promise<T> => {
  await waitOnConsent(vendorIds, omitGdprConsent);
  const result = await callback();
  return result;
};
