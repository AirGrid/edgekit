/*
 * Example usage:
 * const greaterThan10 = gt(10);
 * greaterThan10(11) === true;
 */

export const eq = (a: number) => (b: number): boolean => a === b;

export const gt = (a: number) => (b: number): boolean => b > a;

export const lt = (a: number) => (b: number): boolean => b < a;

export const ge = (a: number) => (b: number): boolean => b >= a;

export const le = (a: number) => (b: number): boolean => b <= a;
