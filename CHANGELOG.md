# Changelog

## Unreleased

## 0.3.1

Added standalone mission, tech stack, roadmap, and changelog documents in the current working tree.

Removed guidance against blank-line suppressions from the rule documentation. Rule behavior did not change. Evidence: [ce99674](https://github.com/emilioSp/oxlint-anti-slop/commit/ce996740d9d2f222cd4e377e115a17512407c7eb).

## 0.3.0

1. Lint compatibility change: Unsafe-type analysis treats unions that contain `any` as unsafe regardless of the `allowUnknown` setting. This can produce additional lint findings.
2. Integration tests use separate fixtures for each scenario, with broader coverage across all 10 rules.
3. Added documentation for each rule and revised the README with installation, configuration, examples, and limitations.
4. Added GitHub Actions to build and test pushes and pull requests to `main` with Node.js 26. Added `.nvmrc` for the same runtime.

Evidence: [v0.2.0 to v0.3.0 comparison](https://github.com/emilioSp/oxlint-anti-slop/compare/v0.2.0...v0.3.0).

Reviewed diffs show no public API or rule-name changes in this version range.
