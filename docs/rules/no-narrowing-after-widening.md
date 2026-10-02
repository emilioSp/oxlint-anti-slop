# `no-narrowing-after-widening`

Do not widen a known local value and then assert that same value to a narrower type. The assertion hides information that was available at the declaration.

## ❌ Bad

```ts
const jobPayload: object = {
  jobId: job.id,
  queue: job.queue,
  retries: 0,
};

const payload = jobPayload as QueueJobPayload;
```

## ✅ Good

```ts
const payload = {
  jobId: job.id,
  queue: job.queue,
  retries: 0,
} satisfies QueueJobPayload;
```

Preserve the inferred type and check the intended contract with `satisfies`. For external input, keep the value as `unknown`, validate it with a named guard, and use the validated value without an assertion.

[Back to available rules](../../README.md#available-rules)
