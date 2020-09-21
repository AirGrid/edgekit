export const timeStampInSecs = (): number => Math.round(Date.now() / 1000);

const get = (key: string): any => {
  const value = localStorage.getItem(key);
  if (!value) return undefined;

  try {
    return JSON.parse(value);
  } catch (e) {
    return undefined;
  }
};

const set = (key: string, value: any): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (e) {
    // ignore...
  }
};

export const storage = {
  set,
  get,
};

export const vectorDistance = (
  vectorA: number[],
  vectorB: number[]
): number => {
  return vectorA.reduce((acc, cur, idx) => acc + cur * vectorB[idx], 0);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const isStringArray = (value: any): value is string[] =>
  value instanceof Array && value.every((item) => typeof item === 'string');

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const isNumberArray = (value: any): value is number[] =>
  value instanceof Array && value.every((item) => typeof item === 'number');
