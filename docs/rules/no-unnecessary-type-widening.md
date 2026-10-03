# `no-unnecessary-type-widening`

Do not throw away structure that TypeScript already knows. The rule reports generic annotations such as `unknown`, `object`, generic dictionaries, and anonymous object types when the initializer already provides a concrete value.

## ❌ Bad

```ts
const webhookEvent = {
  id: delivery.id,
  topic: delivery.topic,
  attempt: delivery.attempt,
};

const eventMetadata: Record<string, unknown> = webhookEvent;
```

## ✅ Good

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

[Back to available rules](../../README.md#available-rules)
