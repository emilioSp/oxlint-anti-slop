# `no-object-parameters`

Do not use `object` for a function parameter. It says that the value is non-primitive but does not describe any property the function can use.

## ❌ Bad

```ts
export async function queueInvoiceEmail(
  invoice: object,
): Promise<void> {
  await emailQueue.add('invoice-ready', invoice);
}
```

## ✅ Good

```ts
type InvoiceEmail = {
  invoiceId: string;
  recipient: string;
  locale: string;
};

export async function queueInvoiceEmail(
  invoice: InvoiceEmail,
): Promise<void> {
  await emailQueue.add('invoice-ready', invoice);
}
```

Use a named domain type for an internal contract. At an untrusted boundary, accept `unknown`, validate it, and pass the validated value to the domain function.

[Back to available rules](../../README.md#available-rules)
