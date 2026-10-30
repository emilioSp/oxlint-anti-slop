# R-07: Test recognition

## Decisions

Recognize tests by function name rather than framework imports, as approved by the owner. This keeps recognition independent of a framework registry. See
[REQ1](spec.md#req1-recognize-tests-by-function-name).

Import-aware recognition was considered but would require maintaining supported framework imports. The chosen approach deliberately also checks unrelated local functions
named `test` or `it`.

For title extraction, use the owner's supplied approach: read a literal's value; for a template literal, join its quasis using the literal placeholder `${value}`, reading
each quasi as `value.cooked ?? value.raw`; return `null` for other expressions. This checks written template structure rather than evaluating interpolations. See
[REQ3](spec.md#req3-check-the-written-title-structure). A `null` extraction result produces a diagnostic; intentional exceptions use inline rule suppression.

Include plugin registration under the approved rule name so the existing CLI test runner can load it through the built plugin. See
[REQ4](spec.md#req4-expose-the-rule-under-its-approved-name).

Changes to `.oxlintrc.json` are deferred. Do not replace or remove its current `vitest/valid-title` configuration in this change. Dedicated rule documentation and a
README rule-list entry are included; see [REQ6](spec.md#req6-document-the-rule-and-list-it-in-the-readme). README configuration examples use the new rule instead of
native title enforcement; see [REQ7](spec.md#req7-use-the-new-rule-in-readme-configuration-examples).

## Risks and limits

The existing title rule was not enough for Playwright: with installed Oxlint 1.86.0, `vitest/valid-title` misses invalid titles imported from `@playwright/test`. Rather
than scatter title enforcement across framework-specific rules, keep all agreed test-title logic in one framework-independent rule.

This addresses a coverage gap rather than duplicating sufficient native enforcement, consistent with [D-01](../../ADR.md#d-01-do-not-duplicate-oxlint-rules). See the
[native rule documentation](https://oxc.rs/docs/guide/usage/linter/rules/vitest/valid-title).
