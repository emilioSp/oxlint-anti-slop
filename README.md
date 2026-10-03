# oxlint-anti-slop

Opinionated [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) rules for AI-assisted TypeScript development. Enforce explicit coding standards with actionable diagnostics that explain what to change and why.

## A quick example

Stop silencing the type checker. Validate the value instead.

The `no-chained-type-assertions` rule rejects assertion chains that bypass type checking:

```ts
// Bad: an assertion is not validation.
const order = payload as unknown as Order;
```

Oxlint reports:

> Do not chain type assertions. Keep the original type, or validate external input with a named type guard before using the domain type.

```ts
// Good: validate the payload before using it.
if (!isOrder(payload)) {
  throw new Error('Invalid order payload.');
}

const order = payload;
```

`isOrder` must check the value's structure at runtime. Moving the assertion into a helper does not make it safe.

## 📋 Prerequisites

- Node.js 26 or newer
- Oxlint 1.86 or newer

## 📦 Install

Install Oxlint and the plugin as development dependencies:

```sh
npm install --save-dev oxlint oxlint-anti-slop
```

Create the `.oxlintrc.json` file described in [Configuration](#configuration) in the project root.

Run Oxlint with that configuration:

```sh
npx oxlint .
```

You can add the command to `package.json`:

```json
{
  "scripts": {
    "lint": "oxlint ."
  }
}
```

<a id="configuration"></a>

## ⚙️ Configuration

Create `.oxlintrc.json` in the project root with the complete plugin configuration:

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
    "anti-slop/no-unnecessary-type-widening": "error",
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-reduce-accumulator-copy": "error",
    "anti-slop/no-typeof-outside-guards": "error",
    "anti-slop/no-meaningless-unknown-aliases": "error",
    "anti-slop/no-unsafe-dictionary-values": "error",
    "anti-slop/no-narrowing-after-widening": "error",
    "anti-slop/require-type-assertion-justification": "error",
    "anti-slop/require-logical-blank-lines": "error"
  }
}
```

The `jsPlugins` entry loads the installed npm package and gives it the `anti-slop` prefix. The `rules` entries enable individual rules.

A rule can be set to `error`, `warn`, or `off`:

```json
{
  "rules": {
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-typeof-outside-guards": "warn",
    "anti-slop/no-reduce-accumulator-copy": "off"
  }
}
```

Use an inline comment to define an intentional exception.

```ts
// oxlint-disable-next-line anti-slop/no-object-parameters
export function parseLegacyPayload(value: object): object {
  return value;
}
```

<a id="available-rules"></a>

## 🧰 Available rules

These rules are intentionally opinionated. Some target type and performance pitfalls; others enforce team conventions rather than detect bugs. Enable the rules that fit your project and set the others to `off`.

### Types and contracts

| Rule | Enforces |
| --- | --- |
| [`no-chained-type-assertions`](docs/rules/no-chained-type-assertions.md) | Type assertions must not be chained to hide an unsafe conversion. |
| [`no-unnecessary-type-widening`](docs/rules/no-unnecessary-type-widening.md) | Values with known structure must not be assigned to generic types. |
| [`no-object-parameters`](docs/rules/no-object-parameters.md) | Function parameters must not use the generic `object` type. |
| [`no-meaningless-unknown-aliases`](docs/rules/no-meaningless-unknown-aliases.md) | A type alias must not hide `unknown`. |
| [`no-unsafe-dictionary-values`](docs/rules/no-unsafe-dictionary-values.md) | Dictionary values must not use `any`, `object`, or `{}` as escape hatches. |
| [`no-narrowing-after-widening`](docs/rules/no-narrowing-after-widening.md) | A known local value must not be widened and later asserted to a narrower type. |

### Performance

| Rule | Enforces |
| --- | --- |
| [`no-reduce-accumulator-copy`](docs/rules/no-reduce-accumulator-copy.md) | Reducers must not copy a growing accumulator on every iteration. |

### Conventions and readability

| Rule | Enforces |
| --- | --- |
| [`no-typeof-outside-guards`](docs/rules/no-typeof-outside-guards.md) | Runtime `typeof` checks must live in named type guards, except for existence probes. |
| [`require-type-assertion-justification`](docs/rules/require-type-assertion-justification.md) | Non-const type assertions must explain the invariant they rely on. |
| [`require-logical-blank-lines`](docs/rules/require-logical-blank-lines.md) | Logical declarations and statement groups must have readable spacing. |

## Limitations

Rules are deterministic checks based on syntax and local analysis, not a full TypeScript type check. They can miss problematic code or flag intentional patterns. Keep type checking, tests, and code review in your workflow: passing this lint does not guarantee correctness.

`require-type-assertion-justification` checks for an explanation, not whether that explanation is true. A comment cannot make an unsafe assertion safe.