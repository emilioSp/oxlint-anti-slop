export const values = [[1], [2]].reduce<number[]>((result, item) => {
  result.push(...item.slice());
  return result;
}, []);
