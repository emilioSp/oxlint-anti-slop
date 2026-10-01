const DEFAULT_PAGE_SIZE = 25;

const isPositivePageSize = (value: unknown): value is number =>
  typeof value === 'number' && value > 0;

export function resolvePageSize(value: unknown): number {
  return isPositivePageSize(value) ? value : DEFAULT_PAGE_SIZE;
}
