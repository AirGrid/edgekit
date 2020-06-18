export const get = (key: string) => {
  const value = localStorage.getItem(key);
  if (!value) return undefined;
  
  try {
    return JSON.parse(value);
  } catch (e) {
    return undefined;
  }
};

export const set = (key: string, value: object) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (e) {
    // ignore...
  }
};
