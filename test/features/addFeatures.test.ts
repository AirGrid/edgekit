import { edkt } from '../../src';
import { getPageViews } from '../helpers/localStorageSetup';

describe('edkt viewStore add behaviour', () => {
  const vendorIds = [873];
  const omitGdprConsent = true;

  const features = {
    keywords: {
      version: 1,
      value: ['sport', 'soccer', 'football'],
    },
    someVector: {
      version: 2,
      value: [0.4, 0.2, 0.1, 0.8],
    },
  };

  const moreFeatures = {
    metaKeywords: {
      version: 1,
      value: ['foo', 'bar', 'baz'],
    },
  };

  it('should set the page features in the store', async () => {
    await edkt.run({
      pageFeatures: { ...features, ...moreFeatures },
      audienceDefinitions: [],
      omitGdprConsent,
      vendorIds,
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
