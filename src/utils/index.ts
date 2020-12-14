export const timeStampInSecs = (): number => Math.round(Date.now() / 1000);

export const timeout = (milliseconds: number, message: string): Promise<void> =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), milliseconds);
  });

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
