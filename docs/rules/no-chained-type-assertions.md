# `no-chained-type-assertions`

Do not chain TypeScript assertions such as `as unknown as Order`. See the [quick example](../../README.md#a-quick-example) for the diagnostic and correction. For external input such as `response.json()`, assign the result to `unknown` and validate it before use.

[Back to available rules](../../README.md#available-rules)
