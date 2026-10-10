# Design decisions

## D-01: Do not duplicate Oxlint rules

Choice: The plugin must not duplicate rules that Oxlint already provides. Use the existing Oxlint rule instead.

Reason: The owner confirmed this choice as common sense.

Rejected approach: Implementing a plugin rule that duplicates an existing Oxlint rule.

Constraint: Check existing Oxlint rules before adding a plugin rule.

Evidence: The owner confirmed this decision during initialization. The [repository configuration](.oxlintrc.json) already enables native Oxlint rules alongside plugin rules. The [suggested configuration](README.md#suggested-configuration) documents this combination.
