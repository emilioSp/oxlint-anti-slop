// Objective: Verify typeof outside guard diagnostics. Used when testing no-typeof-outside-guards.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noTypeofOutsideGuards;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'inline-typeof-check',
      description: 'a runtime typeof check outside a type guard',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'named-type-guard',
      description: 'a runtime typeof check inside a named type guard',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'existence-probe',
      description: 'a typeof expression compared with the string undefined',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'reversed-existence-probe',
      description: 'the string undefined compared with a typeof expression',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'type-query',
      description: 'a TypeScript typeof type query',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'assertion-function',
      description: 'a runtime typeof check inside an assertion function',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'boolean-return-is-not-guard',
      description: 'a typeof check inside a function returning boolean',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'nested-callback-is-not-guard',
      description: 'a typeof check inside a callback nested in a type guard',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'undefined-value-is-not-existence-probe',
      description: 'a typeof expression compared with the value undefined',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
  ],
});
