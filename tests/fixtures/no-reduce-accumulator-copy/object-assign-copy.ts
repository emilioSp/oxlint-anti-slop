export const values = ['first'].reduce<Record<string, number>>((result, key) => Object.assign({}, result, { [key]: 1 }), {});
