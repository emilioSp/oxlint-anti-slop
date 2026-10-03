const isString = (value: unknown): value is string => typeof value === 'string';
export function check(value: unknown) { return isString(value); }
