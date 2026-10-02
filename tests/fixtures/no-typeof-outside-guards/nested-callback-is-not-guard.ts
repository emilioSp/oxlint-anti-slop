export function isString(value: unknown): value is string {
  return [value].every((item) => typeof item === 'string');
}
