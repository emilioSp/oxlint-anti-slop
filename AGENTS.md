# AGENTS.md

## Project overview

npm library for a oxlint anti-slop plugin.

## Commands

- `npm run check` | Run lint, build and all tests.

## At session start (clock in)

Read `ROADMAP.md`, `CHANGELOG.md`, and `ADR.md`.

## Before session end (clock out)

1. Update `ADR.md` only when the session includes a significant architectural decision.
2. Update `ROADMAP.md`, but only when you worked on an item already present in it

## Documentation

Every rule MUST have a dedicated documentation file in `docs/rules/`. Keep it up to date when the rule changes. Rule documentation is for HUMANS, not agents.

README.md, and all docs under /docs folder are intended for humans. Don't write them for agents. They are not.
