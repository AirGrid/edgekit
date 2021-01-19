import { Page } from 'playwright';

type mockData = {
  headers?: Record<string, string>;
  body: string;
};

const makeJsonResponse = (data: unknown) => ({
  contentType: 'application/json',
  headers: { 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(data),
});

const makeHtmlResponse = (data: mockData) => ({
  contentType: 'text/html',
  headers: { 'Access-Control-Allow-Origin': '*', ...data.headers },
  body: data.body,
});

export const waitForJsonResponse = async (
  page: Page,
  fullUrl: string,
  timeout = 5000
): Promise<unknown> => {
  const url = fullUrl.replace('?edktDebug=true', '');
  const rep = await page.waitForResponse(url, { timeout });
  return rep.json();
};

export const mockJsonResponse = (
  page: Page,
  url: string,
  data: unknown
): void => {
  page.route(url, (route) => route.fulfill(makeJsonResponse(data)));
};

export const mockHtmlResponse = (
  page: Page,
  url: string,
  data: { body: string }
): void => {
  page.route(url, (route) => route.fulfill(makeHtmlResponse(data)));
};
