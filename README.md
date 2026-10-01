# oxlint-anti-slop

An npm plugin for [Oxlint](https://oxc.rs/docs/guide/usage/linter/) that helps coding agents produce code that can survive review.

> An agent is smart, but to achieve quality alongside the product you need a harness.

## The idea

AI coding agents can write code quickly. They can also add unnecessary assertions and choose implementations that are hard to review and understand.

oxlint-anti-slop combats AI slop with strict rules. Each rule is deterministic. When a rule fails, Oxlint displays an actionable message that tells the agent how to fix the code.

The plugin is based on Oxlint and adds a small set of strict rules for TypeScript code.

## Prerequisites

- Node.js 26 or newer
- Oxlint 1.86 or newer

## Install

Install Oxlint and the plugin as development dependencies:

```sh
npm install --save-dev oxlint oxlint-anti-slop
```

Create the `oxlint.json` file described in [Configuration](#configuration) in the project root.

Run Oxlint with that configuration:

```sh
npx oxlint --config oxlint.json .
```

You can add the command to `package.json`:

```json
{
  "scripts": {
    "lint": "oxlint --config oxlint.json ."
  }
}
```

Oxlint uses `.oxlintrc.json` as its default JSON configuration filename. If you use that filename instead of `oxlint.json`, you can run `npx oxlint .` without `--config`.

## Configuration

Create `oxlint.json` in the project root with the complete plugin configuration:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "jsPlugins": [
    {
      "name": "anti-slop",
      "specifier": "oxlint-anti-slop"
    }
  ],
  "rules": {
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-known-value-widening": "error",
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-reduce-accumulator-copy": "error",
    "anti-slop/no-runtime-typeof": "error",
    "anti-slop/no-unknown-type-aliases": "error",
    "anti-slop/no-unsafe-dictionary-type": "error",
    "anti-slop/no-widen-then-assert": "error",
    "anti-slop/require-justification-comment-for-type-assertion": "error",
    "anti-slop/require-readable-spacing": "error"
  }
}
```

The `jsPlugins` entry loads the installed npm package and gives it the `anti-slop` prefix. The `rules` entries enable individual rules.

A rule can be set to `error`, `warn`, or `off`:

```json
{
  "rules": {
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-runtime-typeof": "warn",
    "anti-slop/no-reduce-accumulator-copy": "off"
  }
}
```

## Available rules

| Rule | Enforces |
| --- | --- |
| `no-chained-type-assertions` | Type assertions must not be chained to hide an unsafe conversion. |
| `no-known-value-widening` | Values with known structure must not be assigned to generic types. |
| `no-object-parameters` | Function parameters must not use the generic `object` type. |
| `no-reduce-accumulator-copy` | Reducers must not copy a growing accumulator on every iteration. |
| `no-runtime-typeof` | Runtime `typeof` checks must live in named type guards, except for existence probes. |
| `no-unknown-type-aliases` | A type alias must not hide `unknown`. |
| `no-unsafe-dictionary-type` | Dictionary values must not use `any`, `object`, or `{}` as escape hatches. |
| `no-widen-then-assert` | A known local value must not be widened and later asserted to a narrower type. |
| `require-justification-comment-for-type-assertion` | Non-const type assertions must explain the invariant they rely on. |
| `require-readable-spacing` | Logical declarations and statement groups must have readable spacing. |

The list above is the complete list of rules currently provided by the plugin.

## Rule details

### `no-chained-type-assertions`

Do not chain TypeScript assertions such as `as unknown as Order`. A chain hides the fact that no runtime validation has taken place.

#### ❌ Bad

```ts
export async function loadOrder(
  response: Response,
): Promise<Order> {
  const order = (await response.json()) as unknown as Order;

  return order;
}
```

#### ✅ Good

```ts
export async function loadOrder(
  response: Response,
): Promise<Order> {
  const payload: unknown = await response.json();

  if (!isOrder(payload)) {
    throw new Error('Order response is invalid.');
  }

  return payload;
}
```

### `no-known-value-widening`

Do not throw away structure that TypeScript already knows. The rule reports generic annotations such as `unknown`, `object`, generic dictionaries, and anonymous object types when the initializer already provides a concrete value.

#### ❌ Bad

```ts
const webhookEvent = {
  id: delivery.id,
  topic: delivery.topic,
  attempt: delivery.attempt,
};

const eventMetadata: Record<string, unknown> = webhookEvent;
```

#### ✅ Good

```ts
type WebhookEventMetadata = {
  id: string;
  topic: string;
  attempt: number;
};

const eventMetadata: WebhookEventMetadata = {
  id: delivery.id,
  topic: delivery.topic,
  attempt: delivery.attempt,
};
```

Use a named domain type when the value crosses an API or domain boundary. Use `satisfies` with that named type when literal values must remain narrow.

### `no-object-parameters`

Do not use `object` for a function parameter. It says that the value is non-primitive but does not describe any property the function can use.

#### ❌ Bad

```ts
export async function queueInvoiceEmail(
  invoice: object,
): Promise<void> {
  await emailQueue.add('invoice-ready', invoice);
}
```

#### ✅ Good

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

### `no-reduce-accumulator-copy`

Do not copy a growing reducer accumulator on every iteration. Repeated `concat`, `slice`, `toSpliced`, `Object.assign`, or similar operations can create quadratic work and unnecessary allocations.

#### ❌ Bad

```ts
const searchDocuments = documents.reduce<SearchDocument[]>(
  (matches, document) =>
    document.isPublished
      ? matches.concat(toSearchDocument(document))
      : matches,
  [],
);
```

#### ✅ Good

```ts
const searchDocuments = documents.reduce<SearchDocument[]>(
  (matches, document) => {
    if (!document.isPublished) {
      return matches;
    }

    matches.push(toSearchDocument(document));

    return matches;
  },
  [],
);
```

Mutate a fresh accumulator owned by the reducer, or use a clear loop or transformation such as `flatMap` when that better expresses the operation.

### `no-runtime-typeof`

Do not use `typeof` as an inline substitute for decoding an external value. Put runtime checks in a named type guard so the validation has a reusable name and a declared result.

#### ❌ Bad

```ts
export function resolvePageSize(value: unknown): number {
  return typeof value === 'number' && value > 0 ? value : 25;
}
```

#### ✅ Good

```ts
const isPositivePageSize = (value: unknown): value is number =>
  typeof value === 'number' && value > 0;

export function resolvePageSize(value: unknown): number {
  return isPositivePageSize(value) ? value : 25;
}
```

`typeof` is allowed inside a named type guard. Existence checks such as `typeof window === 'undefined'` are also allowed.

### `no-unknown-type-aliases`

Do not create an alias that only hides `unknown`. The alias adds a name but no information about the value.

#### ❌ Bad

```ts
type IncomingWebhookBody = unknown;

export async function handleWebhook(
  body: IncomingWebhookBody,
): Promise<void> {
  await processWebhook(body);
}
```

#### ✅ Good

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

### `no-unsafe-dictionary-type`

Do not use `any`, `object`, or `{}` as the value type of a dictionary. These types allow callers to store values without a useful contract. `unknown` is allowed for intentionally dynamic data, but callers must validate values before using them.

#### ❌ Bad

```ts
type TenantSettings = Record<string, any>;

const settingsByTenant: TenantSettings = await loadTenantSettings();
```

#### ✅ Good

```ts
type TenantSettings = {
  timezone: string;
  invoicePrefix: string;
};

const settingsByTenant: Record<string, TenantSettings> =
  await loadTenantSettings();
```

Use a concrete value type when the domain is known. Use `Record<string, unknown>` only when the data is genuinely dynamic and must be checked at the point of use.

### `no-widen-then-assert`

Do not widen a known local value and then assert that same value to a narrower type. The assertion hides information that was available at the declaration.

#### ❌ Bad

```ts
const jobPayload: object = {
  jobId: job.id,
  queue: job.queue,
  retries: 0,
};

const payload = jobPayload as QueueJobPayload;
```

#### ✅ Good

```ts
const payload = {
  jobId: job.id,
  queue: job.queue,
  retries: 0,
} satisfies QueueJobPayload;
```

Preserve the inferred type and check the intended contract with `satisfies`. For external input, keep the value as `unknown`, validate it with a named guard, and use the validated value without an assertion.

### `require-justification-comment-for-type-assertion`

Every non-const TypeScript assertion must explain the invariant that TypeScript cannot prove. `as const` is excluded.

#### ❌ Bad

```ts
const customer = apiResponse.body as Customer;
```

#### ✅ Good

```ts
// JUSTIFICATION: decodeCustomerResponse verifies the API version and every required field.
const customer = apiResponse.body as Customer;
```

A marker alone is not enough; an explanation is required.

### `require-readable-spacing`

Keep blank lines between imports and declarations, between top-level declarations, around multiline declarations, and between logical control-flow groups. Related imports and overload declarations can stay together.

#### ❌ Bad

```ts
import { invoiceRepository } from '#billing/invoice-repository';
import { sendInvoice } from '#billing/send-invoice';

type Invoice = {
  id: string;
  recipient: string;
};
export async function sendInvoiceById(invoiceId: string): Promise<void> {
  const invoice = await invoiceRepository.find(invoiceId);
  if (invoice === null) {
    throw new Error('Invoice not found.');
  }
  await sendInvoice(invoice);
}
```

#### ✅ Good

```ts
import { invoiceRepository } from '#billing/invoice-repository';
import { sendInvoice } from '#billing/send-invoice';

type Invoice = {
  id: string;
  recipient: string;
};

export async function sendInvoiceById(invoiceId: string): Promise<void> {
  const invoice = await invoiceRepository.find(invoiceId);

  if (invoice === null) {
    throw new Error('Invoice not found.');
  }

  await sendInvoice(invoice);
}
```

Add the blank line that separates the logical groups. Do not use a suppression to keep unrelated statements together.

## License

MIT
