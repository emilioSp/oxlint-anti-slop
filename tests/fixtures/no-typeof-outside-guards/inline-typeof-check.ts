const DEFAULT_PAGE_SIZE = 25;

export function resolvePageSize(value: unknown): number {
  return typeof value === 'number' && value > 0 ? value : DEFAULT_PAGE_SIZE;
}
