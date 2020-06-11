import fetchMock from 'jest-fetch-mock'
import { edkt } from '../src';

describe('EdgeKit edkt() API tests', () => {
  it('expects edkt_page_views length to be 1', async () => {
    document.head.innerHTML = 
      `<meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <meta name="keywords" content="sport,news,football,stadium">
      <title>Article about sports, news and football!</title>`

    const getHtmlKeywords = {
      name: 'keywords',
      func: (): Promise<string[]> => {
        const tag = <HTMLElement>document.head.querySelector('meta[name="keywords"]');
        const keywordString = tag.getAttribute('content') || '';
        const keywords = keywordString.toLowerCase().split(',');
        return Promise.resolve(keywords);
      }
    }

    await edkt({
      pageFeatureGetters: [getHtmlKeywords]
    });

    const edktPageViews = JSON.parse(localStorage.getItem('edkt_page_views') || '[]');
    expect(edktPageViews.length).toEqual(1);
  });

  it('expects edkt_page_views length to be 2', async () => {
    fetchMock.mockOnce(JSON.stringify('keywords,mocked,with,fetch'));
  
    const getHttpKeywords = {
      name: 'keywords',
      func: async (): Promise<string[]> => {
        const response = await fetch('https://jsonplaceholder.typicode.com/albums/1');
        const json = await response.json();
        const keywords = json.split(',');
        return keywords;
      }
    }

    await edkt({
      pageFeatureGetters: [getHttpKeywords]
    });

    const edktPageViews = JSON.parse(localStorage.getItem('edkt_page_views') || '[]');

    expect(edktPageViews.length).toEqual(2);
  });
});