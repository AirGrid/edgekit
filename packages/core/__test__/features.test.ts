import { getPageFeatures } from '../src/features';

describe('EdgeKit | Features Module', () => {
  it('able to extract html keywords', async () => {
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

    const features = await getPageFeatures([getHtmlKeywords]);

    expect(features[0]).toEqual({
      error: false, 
      name: 'keywords', 
      value: ['sport', 'news', 'football', 'stadium']
    });
  });
});