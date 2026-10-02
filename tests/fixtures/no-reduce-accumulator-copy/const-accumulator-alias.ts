export const values = [1, 2].reduce<number[]>((result, value) => {
  const alias = result;
  return alias.concat(value);
}, []);
