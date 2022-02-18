const euclideanLength = (vector: number[]): number => {
  return Math.sqrt(vector.reduce((acc, cur) => acc + Math.pow(cur, 2), 0));
};

const cosineScaler = (x: number): number => {
  const MAX = 0.9;
  const MIN = -0.5;
  const scaled = (x - MIN) / (MAX - MIN);
  if (scaled >= 1) return 1;
  if (scaled <= 0) return 0;
  return scaled;
};

export const dotProduct = (vectorA: number[], vectorB: number[]): number => {
  return vectorA.reduce((acc, cur, idx) => acc + cur * vectorB[idx], 0);
};

export const cosineSimilarity = (
  vectorA: number[],
  vectorB: number[]
): number => {
  const cosineSim =
    dotProduct(vectorA, vectorB) /
    (euclideanLength(vectorA) * euclideanLength(vectorB));
  return cosineScaler(cosineSim);
};

export const sigmoid = (z: number): number => {
  return 1 / (1 + Math.exp(-z));
};
