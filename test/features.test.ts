import { PageFeatureResult } from '../types';
import { getPageFeatures } from '../src/features';
import { viewStore } from 'src/store';
import { edkt } from '../src';

describe('EdgeKit | Features Module', () => {
  it('able to extract html keywords', async () => {
    document.head.innerHTML = `<meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <meta name="keywords" content="sport,news,football,stadium">
      <title>Article about sports, news and football!</title>`;

    const getHtmlKeywords = {
      name: 'keywords',
      func: (): Promise<PageFeatureResult> => {
        const tag = <HTMLElement>(
          document.head.querySelector('meta[name="keywords"]')
        );
        const keywordString = tag.getAttribute('content') || '';
        const keywords = keywordString.toLowerCase().split(',');
        return Promise.resolve({
          version: 1,
          value: keywords,
        });
      },
    };

    const features = await getPageFeatures([getHtmlKeywords]);

    expect(features[0]).toEqual({
      error: false,
      name: 'keywords',
      version: 1,
      value: ['sport', 'news', 'football', 'stadium'],
    });
  });

  describe('setPageFeature', () => {
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

    beforeAll(() => {
      viewStore._load();
    });

    afterAll(() => {
      localStorage.clear();
    });

    it('should set the page features in the store', async () => {
      await edkt.setPageFeatures([873], features, omitGdprConsent);

      const edktPageViews = JSON.parse(
        localStorage.getItem('edkt_page_views') || '[]'
      );

      expect(edktPageViews).toEqual([
        {
          features,
          ts: edktPageViews[0].ts,
        },
      ]);
    });

    it('should set additional page features in the store', async () => {
      await edkt.setPageFeatures([873], moreFeatures, omitGdprConsent);

      const edktPageViews = JSON.parse(
        localStorage.getItem('edkt_page_views') || '[]'
      );

      expect(edktPageViews).toEqual([
        {
          features,
          ts: edktPageViews[0].ts,
        },
        {
          features: moreFeatures,
          ts: edktPageViews[1].ts,
        },
      ]);
    });
  });
});
