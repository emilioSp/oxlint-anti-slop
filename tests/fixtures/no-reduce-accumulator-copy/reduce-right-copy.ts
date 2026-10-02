export const values = [1, 2].reduceRight<number[]>((result, value) => result.concat(value), []);
