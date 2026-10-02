# `no-chained-type-assertions`

Do not chain TypeScript assertions such as `as unknown as Order`.

## ❌ Bad

```ts
// Bad: an assertion is not validation.
const order = payload as unknown as Order;
```

Oxlint reports:

> Do not chain type assertions. Keep the original type, or validate external input with a named type guard before using the domain type.

## ✅ Good

```ts
// Good: validate the payload before using it.
if (!isOrder(payload)) {
  throw new Error('Invalid order payload.');
}

const order = payload;
```

`isOrder` must check the value's structure at runtime. Moving the assertion into a helper does not make it safe.

For external input such as `response.json()`, assign the result to `unknown` and validate it before use.

[Back to available rules](../../README.md#available-rules)
