# `no-unsafe-dictionary-values`

Do not use `any`, `object`, or `{}` as the value type of a dictionary. These types allow callers to store values without a useful contract. `unknown` is allowed for intentionally dynamic data, but callers must validate values before using them.

## ❌ Bad

```ts
type TenantSettings = Record<string, any>;

const settingsByTenant: TenantSettings = await loadTenantSettings();
```

## ✅ Good

```ts
type TenantSettings = {
  timezone: string;
  invoicePrefix: string;
};

const settingsByTenant: Record<string, TenantSettings> =
  await loadTenantSettings();
```

Use a concrete value type when the domain is known. Use `Record<string, unknown>` only when the data is genuinely dynamic and must be checked at the point of use.

[Back to available rules](../../README.md#available-rules)
