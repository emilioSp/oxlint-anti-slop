export function preserve<T extends Record<string, any>>(value: T): T {
  return value;
}
