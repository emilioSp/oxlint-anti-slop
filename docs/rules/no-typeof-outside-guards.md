# `no-typeof-outside-guards`

Do not use `typeof` as an inline substitute for decoding an external value. Put runtime checks in a named type guard so the validation has a reusable name and a declared result.

## ❌ Bad

```ts
export function resolvePageSize(value: unknown): number {
  return typeof value === 'number' && value > 0 ? value : 25;
}
```

## ✅ Good

```ts
const isPositivePageSize = (value: unknown): value is number =>
  typeof value === 'number' && value > 0;

export function resolvePageSize(value: unknown): number {
  return isPositivePageSize(value) ? value : 25;
}
```

`typeof` is allowed inside a named type guard. Existence checks such as `typeof window === 'undefined'` are also allowed.

[Back to available rules](../../README.md#available-rules)
