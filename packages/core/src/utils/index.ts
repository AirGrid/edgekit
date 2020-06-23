export const timeStampInSecs = (): number => Math.round(Date.now() / 1000);

const get = (key: string) => {
  const value = localStorage.getItem(key);
  if (!value) return undefined;

  try {
    return JSON.parse(value);
  } catch (e) {
    return undefined;
  }
};

const set = (key: string, value: any) => {
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
