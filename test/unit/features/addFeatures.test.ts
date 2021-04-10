import { edkt } from '../../../src';
import { getPageViews } from '../../helpers/localStorage';

describe('edkt viewStore add behaviour', () => {
  const VENDOR_IDS = [873];
  const OMIT_GDPR_CONSENT = true;

  const features = {
    docVector: {
      version: 1,
      value: [1, 1, 1],
    },
  };

  const moreFeatures = {
    metaKeywords: {
      version: 1,
      value: [0, 0, 0],
    },
  };

  it('should set the page features in the store', async () => {
    await edkt.run({
      pageFeatures: { ...features, ...moreFeatures },
      audienceDefinitions: [],
      omitGdprConsent: OMIT_GDPR_CONSENT,
      vendorIds: VENDOR_IDS,
    });

    const edktPageViews = getPageViews();

    expect(edktPageViews).toEqual([
      {
        features: {
          ...features,
          ...moreFeatures,
        },
        ts: edktPageViews[0].ts,
      },
    ]);
  });
});
