# R-07: Require given/when/then test titles

## Problem

The repository currently uses `vitest/valid-title`, which does not enforce the configured title format for Playwright imports. A check with the installed Oxlint 1.86.0
reports `test('bad title', ...)` imported from Vitest but reports nothing for the same title imported from `@playwright/test`.

## Goal and scope

Implement and register `anti-slop/tests-require-given-when-then`, with tests, dedicated documentation in `docs/rules/`, and README rule-list and configuration-example
updates, for framework agnostic enforcement of test case title structure, including Playwright.

## Out of scope

Changes to `.oxlintrc.json`, replacement of the repository's `vitest/valid-title` configuration, suite title enforcement, runtime evaluation of titles, import or alias
tracking, new dependencies, automatic title rewriting, and unrelated roadmap items.

## Required behavior

See [spec.md](spec.md).
