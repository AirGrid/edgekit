import { TCData } from '../../types';

const hasConsent = (gdprApplies?: boolean): boolean => {
  return gdprApplies === undefined ? false : gdprApplies;
};

export const hasGdprConsent = (vendorIds?: number[]): Promise<boolean> => {
  return new Promise((resolve) => {
    // If the api is missing then assume no consent
    if (window.__tcfapi === undefined) resolve(false);
    else {
      window.__tcfapi(
        'getTCData',
        2,
        ({ gdprApplies, vendor }: TCData, success: boolean) => {
          if (success && vendorIds) {
            resolve(
              hasConsent(gdprApplies) &&
                vendorIds.every((vendorId) => !!vendor.consents[vendorId])
            );
          } else {
            resolve(false);
          }
        }
      );
    }
  });
};
