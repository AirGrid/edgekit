import fetchMock from 'jest-fetch-mock';
import { PageFeatureResult } from '../types';
import { edkt, allAudienceDefinitions } from '../src';

const sportKeywordsString = 'golf,liverpool,football,stadium';
// const travelKeywordsString = 'beach,holiday,cruise,mojito'

const sportsKeywordsHtml = `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <meta name="keywords" content="${sportKeywordsString}">
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

const getHttpKeywords = {
  name: 'keywords',
  func: async (): Promise<PageFeatureResult> => {
    const response = await fetch('https://thisisnevercalled.com/fetchismocked');
    const json = await response.json();
    const keywords = json.split(',');
    return {
      version: 1,
      value: keywords,
    };
  },
};

describe('EdgeKit edkt() API tests', () => {
  it('expects edkt_page_views length to be 1', async () => {
    document.head.innerHTML = sportsKeywordsHtml;

    await edkt.run({
      pageFeatureGetters: [getHtmlKeywords],
      audienceDefinitions: allAudienceDefinitions,
      omitGdprConsent: true,
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    expect(edktPageViews.length).toEqual(1);
  });

  it('expects edkt_page_views length to be 2', async () => {
    fetchMock.mockOnce(JSON.stringify(sportKeywordsString));

    await edkt.run({
      pageFeatureGetters: [getHttpKeywords],
      audienceDefinitions: allAudienceDefinitions,
      omitGdprConsent: true,
    });

    const edktPageViews = JSON.parse(
      localStorage.getItem('edkt_page_views') || '[]'
    );

    expect(edktPageViews.length).toEqual(2);
  });

  it('sports audience should not be stored in matched audiences when no audience definitions are sent', async () => {
    fetchMock.mockOnce(JSON.stringify(sportKeywordsString));

    await edkt.run({
      pageFeatureGetters: [getHttpKeywords],
      audienceDefinitions: [],
      omitGdprConsent: true,
    });

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktMatchedAudiences.length).toEqual(0);
  });

  it('sports audience should be stored in matched audiences', async () => {
    fetchMock.mockOnce(JSON.stringify(sportKeywordsString));

    await edkt.run({
      pageFeatureGetters: [getHttpKeywords],
      audienceDefinitions: allAudienceDefinitions,
      omitGdprConsent: true,
    });

    const edktMatchedAudiences = JSON.parse(
      localStorage.getItem('edkt_matched_audiences') || '[]'
    );

    expect(edktMatchedAudiences[0]).toHaveProperty('id', 'iab-607');
  });
});
