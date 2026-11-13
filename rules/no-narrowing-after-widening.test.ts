// Objective: Verify narrowing-after-widening diagnostics. Used when testing no-narrowing-after-widening.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noNarrowingAfterWidening;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'object-widening-then-assertion',
      description: 'an object widened then asserted to a structure',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'unknown-to-named-type',
      description: 'a known object widened then asserted to a named type',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'widening-in-initializer',
      description: 'an initializer widened by assertion then narrowed',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'readonly-dictionary-to-structure',
      description: 'an object widened to a readonly dictionary',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'angle-bracket-narrowing',
      description: 'a widened object narrowed with angle brackets',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'same-named-source-type',
      description: 'a named value widened then restored by assertion',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'external-input-has-no-local-evidence',
      description: 'an external unknown value with no known local structure',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'broad-to-broad-assertion',
      description: 'a known value widened to unknown and asserted to object',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'mutable-binding-outside-rule-scope',
      description: 'a mutable binding replaced before narrowing',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'cross-function-flow-outside-rule-scope',
      description: 'a widened binding narrowed inside a different function',
      expectedExitCode: 0,
      expectedCodes: [],
    },
  ],
});
