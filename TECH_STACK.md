# Tech stack

This document describes the current technologies. It does not add mandatory technology choices for future work.

## Plugin and package

| Technology | Role |
| --- | --- |
| TypeScript | Source language. The compiler produces JavaScript and type declarations in `dist/`. |
| Node.js | Runtime for plugin loading and development commands. The package requires version 26 or newer. |
| Oxlint | Linter that loads the plugin and reports rule findings. The package requires version 1.86 or newer. |
| `@oxlint/plugins` | Rule APIs, syntax-tree types, and plugin registration through `eslintCompatPlugin`. |
| ESM | JavaScript module format for the package and its public export. |
| npm | Dependency management, build scripts, and package distribution. |

The package exports `dist/index.js` and `dist/index.d.ts`. Source imports use `#` aliases from [package.json](package.json).

The [TypeScript configuration](tsconfig.json) uses strict checking, NodeNext modules, and the ES2022 target. Compiler type checking is separate from plugin rule analysis.

## Development tools

| Technology | Role |
| --- | --- |
| Oxfmt | Formatting |
| Oxlint | Linting |
| Vitest | Integration tests that invoke the Oxlint command against scenario fixtures. |
| `@types/node` | Node.js types used during compilation. |
| GitHub Actions | Builds and tests on pushes and pull requests to `main`, with Node.js 26 on Ubuntu. |

[npm scripts](package.json) define the local checks. `npm run check` applies lint fixes, builds, and tests. The [CI workflow](.github/workflows/tests.yml) uses `npm test`, not the full local check.

The [test runner](tests/rule-test.ts) loads the built plugin. Fixtures live in [tests/fixtures](tests/fixtures).

## Vendored code

Vendored code is an upstream copy maintained in this repository.

The blank-line rule uses an Oxlint adaptation of ESLint Stylistic's `padding-line-between-statements`. It is not an npm dependency.

[Upstream notes](vendor/eslint-stylistic/UPSTREAM.md) identify the source revision and MIT license. The local policy lives in [require-logical-blank-lines.ts](rules/require-logical-blank-lines.ts).
