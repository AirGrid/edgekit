export const dotProduct = (vectorA: number[], vectorB: number[]): number => {
  return vectorA.reduce((acc, cur, idx) => acc + cur * vectorB[idx], 0);
};

const euclideanLength = (vector: number[]): number => {
  return Math.sqrt(vector.reduce((acc, cur) => acc + Math.pow(cur, 2), 0));
};

export const cosineSimilarity = (
  vectorA: number[],
  vectorB: number[]
): number => {
  return (
    dotProduct(vectorA, vectorB) /
    (euclideanLength(vectorA) * euclideanLength(vectorB))
  );
};

