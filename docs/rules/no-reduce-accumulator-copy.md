# `no-reduce-accumulator-copy`

Do not copy a growing reducer accumulator on every iteration. Repeated `concat`, `slice`, `toSpliced`, `Object.assign`, or similar operations can create quadratic work and unnecessary allocations.

## ❌ Bad

```ts
const searchDocuments = documents.reduce<SearchDocument[]>(
  (matches, document) =>
    document.isPublished
      ? matches.concat(toSearchDocument(document))
      : matches,
  [],
);
```

## ✅ Good

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

[Back to available rules](../../README.md#available-rules)
