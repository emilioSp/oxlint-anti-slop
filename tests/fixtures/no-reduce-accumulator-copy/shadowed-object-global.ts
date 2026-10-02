const Object = { assign: (target: object, source: object) => target };
export const values = ['first'].reduce((result) => Object.assign({}, result), {});
