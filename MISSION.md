# Mission

Help TypeScript developers prevent unsafe shortcuts and unclear code from AI assistants.

`oxlint-anti-slop` provides opinionated Oxlint rules with diagnostics that explain what to change and why. Each developer chooses which rules to enable.

## Scope and responsibility

Rules use deterministic syntax checks and local analysis. Deterministic means the same input produces the same findings.

The plugin does not replace TypeScript checking, tests, runtime validation, or code review. Passing lint does not guarantee correct code.

The owner selects priorities and approves rule behavior. Developers select enabled rules and review intentional exceptions.

See [README.md](README.md) for current rules, usage, and limitations. See [ROADMAP.md](ROADMAP.md) for planned work.
