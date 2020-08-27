# Transparency and Consent Framework API Notes

- [Full API
  doc](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md)

- The [vendor list](https://iabeurope.eu/vendor-list-tcf-v2-0/) (Airgrid is in there)

- API implementors should provide a [stub
  script](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#how-does-the-cmp-stub-api-work)
  initiailly before any other scripts that depend on it are loaded. This builds up a queue of
  callbacks until the CMF is loaded.

- Scripts that rely on the API (ie. Edgekit) [shouldn't need to check if it's
  loaded](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#how-can-scripts-determine-if-the-cmp-script-is-loaded-yet),
  the API implementor should build up a queue of the callbacks with the stub script and then execute
  them once fully loaded.

- [In order to determine if a CMP is
  present](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#how-can-scripts-on-a-page-determine-if-there-is-a-cmp-present), scripts can check for the presence of a function named `__tcfapi` – if it exists then a CMP can be assumed to be present for scripts.

- According to the API spec
  [here](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#what-does-the-gdprapplies-value-mean),
  `gdprApplies` can also exist as an entry in the result and be `undefined`, which means that it is
  yet to be determined. However, for the `getTCData` request, the API spec [also
  specifies](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#tcdata)
  that the callback should not be invoked until `gdprApplies` is known.
