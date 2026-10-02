# `no-meaningless-unknown-aliases`

Do not create an alias that only hides `unknown`. The alias adds a name but no information about the value.

## ❌ Bad

```ts
type IncomingWebhookBody = unknown;

export async function handleWebhook(
  body: IncomingWebhookBody,
): Promise<void> {
  await processWebhook(body);
}
```

## ✅ Good

```ts
type PaymentWebhook = {
  id: string;
  event: 'payment.succeeded';
  amount: number;
};

export async function handleWebhook(
  body: unknown,
): Promise<void> {
  if (!isPaymentWebhook(body)) {
    throw new Error('Webhook payload is invalid.');
  }

  await processPayment(body);
}
```

Keep `unknown` visible at an input boundary, then validate it as a named domain type.

[Back to available rules](../../README.md#available-rules)
