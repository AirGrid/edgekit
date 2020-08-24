/*
Full API doc
https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md

How can scripts on a page determine if there is a CMP present?
https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#how-can-scripts-on-a-page-determine-if-there-is-a-cmp-present

Ping
https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#ping
*/

interface PingResponse {
  gdprApplies?: boolean;
}

interface TCData {
  gdprApplies?: boolean;
  vendor: {
    consents: { [vendorId: number]: boolean | undefined };
  };
}

declare global {
  interface Window {
    __tcfapi(
      command: 'ping',
      version: number,
      cb: (response: PingResponse) => void
    ): void;

    __tcfapi(
      command: 'getTCData',
      version: number,
      cb: (tcData: TCData, success: boolean) => void
    ): void;
  }
}

/*
Note: the api assumes that `undefined` is a still pending response, so hasGdprConsent would be false
https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#what-does-the-gdprapplies-value-mean
*/
const hasConsent = (gdprApplies?: boolean): boolean => {
  return gdprApplies === undefined ? false : gdprApplies;
};

export const hasGdprConsent = (vendorIds: number[]): Promise<boolean> => {
  return new Promise((resolve) => {
    // If the api is missing then assume no consent
    if (window.__tcfapi === undefined) resolve(false);
    else {
      window.__tcfapi(
        'getTCData',
        2,
        ({ gdprApplies, vendor }: TCData, success: boolean) => {
          if (!success) {
            resolve(false);
          } else {
            resolve(
              hasConsent(gdprApplies) &&
                vendorIds.every((vendorId) => !!vendor.consents[vendorId])
            );
          }
        }
      );
    }
  });
};
