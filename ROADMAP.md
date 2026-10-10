# Roadmap

Roadmap items are planning context, not permission to implement. The owner selects work and approves requirements before implementation.

Identifiers stay with their items when priorities change. Later contains uncommitted ideas with no promised order or date.

## Completed

### R-01: Provide the initial rule set

The owner accepted the npm plugin with 10 rules, rule documentation, and Oxlint CLI integration tests. The completion date is not recorded.

Evidence: [plugin registration](index.ts), [rule documentation](README.md#available-rules), and [integration tests](tests/rule-test.ts).

## Now

### R-02: Reject getters and setters

Problem: Accessor syntax conflicts with the owner convention to use explicit methods.

Outcome: A rule reports getter and setter syntax in classes and object literals.

Scope: Explicit methods such as `getName()` and `setName()` remain allowed. The rule provides no automatic fixes.

Completion: Tests and documentation cover both forms, and the owner accepts the behavior.

Dependencies: The existing Oxlint rule API and CLI test runner are available. No additional dependency is identified.

Specification: Not written. Detailed cases remain to be defined before implementation.

## Next

### R-03: Require module headers

Problem: Source modules need a stated objective and use context.

Outcome: A rule requires a leading comment with non-empty `Objective:` and `Used` sections in project source modules.

Scope: Tests and vendored code are excluded. The rule checks text presence, not whether the explanation is correct. No automatic fixes.

Completion: Tests and documentation cover the required header and exclusions, and the owner accepts the behavior.

Dependencies: The existing Oxlint rule API and CLI test runner are available. No additional dependency is identified.

Specification: Not written. Exact comment syntax and source-file selection remain to be defined before implementation.

## Later

### R-04: Restrict the `in` operator

Permit `in` inside type guards and assertion functions. Reject it elsewhere. Detailed function recognition and nested-function behavior remain open.

### R-05: Reject inline object types in function parameters

Require named types instead of inline object types in function parameters. Exact scope and framework exceptions remain open.

### R-06: Assess whether Oxlint can fully replace Biome

Discovery means research before a change decision. Compare Oxlint with the linting, formatting, and import organization enabled in [biome.json](biome.json).

Include file coverage, automatic fixes, and the checks used by [npm scripts](package.json). Distinguish Oxlint alone from a solution that requires additional tools.

Completion: Record supported capabilities, remaining gaps, and a recommendation for the owner. This task does not remove Biome or change dependencies, configuration, or scripts.
