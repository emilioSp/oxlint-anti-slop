// Objective: Verify meaningless unknown alias diagnostics. Used when testing no-meaningless-unknown-aliases.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noMeaninglessUnknownAliases;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'unknown-alias',
      description: 'a type alias for unknown',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'validated-webhook-boundary',
      description: 'an unknown webhook input validated before use',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'unknown-union',
      description: 'a type alias for a union containing unknown',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'parenthesized-unknown',
      description: 'a type alias for parenthesized unknown',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'generic-alias-instantiation',
      description: 'a generic identity alias instantiated with unknown',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'unknown-property',
      description: 'a named object type with an unknown property',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'unknown-array',
      description: 'a type alias for an array of unknown values',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'unknown-intersection',
      description: 'unknown intersected with a structured type',
      expectedExitCode: 0,
      expectedCodes: [],
    },
  ],
});
