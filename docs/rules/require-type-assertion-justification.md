# `require-type-assertion-justification`

Every non-const TypeScript assertion must explain the invariant that TypeScript cannot prove. `as const` is excluded.

## ❌ Bad

```ts
const customer = apiResponse.body as Customer;
```

## ✅ Good

```ts
// JUSTIFICATION: decodeCustomerResponse verifies the API version and every required field.
const customer = apiResponse.body as Customer;
```

A marker alone is not enough; an explanation is required.

[Back to available rules](../../README.md#available-rules)
