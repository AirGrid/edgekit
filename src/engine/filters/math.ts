// These are potentially expensive function calls. I would recommend
// memoization here to reduce the total number of calls necessary after
// the first one. For instance:
//
// dotProduct(1, 2) => (some result) is a required operation every time.
// dotProduct(1, 2, memo[1, 2]) => (some result) can simply access the
// `memo` array/variable/hash table's stored result, and return it, if
// it contains the result of that operation. This would result in O(n).
let stored = {};
export const dotProduct = (
  vectorA: number[],
  vectorB: number[],
  stored: string[]
): number => {
  if(stored(vectorA, vectorB)) {
    return stored(vectorA, vectorB);
  }
  const newResult = vectorA.reduce((acc, cur, idx) => acc + cur * vectorB[idx], 0);
  stored[`${vectorA},${vectorB}`] = newResult;
  return newResult;
};

// (The above code probably would need refactoring to work, but you get
// the idea. Something similar could apply to all expensive functions in
// every part of the application.

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
