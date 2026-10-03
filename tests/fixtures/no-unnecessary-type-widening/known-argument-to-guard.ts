const isString = (value: unknown): value is string => typeof value === 'string';
export const result = isString('ready');
