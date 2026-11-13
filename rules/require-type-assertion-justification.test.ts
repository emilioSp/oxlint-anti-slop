// Objective: Verify type assertion justification diagnostics. Used when testing require-type-assertion-justification.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.requireTypeAssertionJustification;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'unjustified-type-assertion',
      description: 'a type assertion without a justification comment',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'justified-type-assertion',
      description: 'an assertion with a justification and explanation',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'const-assertion',
      description: 'a const assertion without a justification',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'satisfies-contract',
      description: 'a satisfies expression without a justification',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'block-comment-on-export',
      description: 'an exported assertion with a block justification',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'inline-comment-on-assertion',
      description: 'an assertion with an inline justification',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'empty-marker',
      description: 'a justification marker without an explanation',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'marker-inside-another-word',
      description: 'a NOT_JUSTIFICATION comment before an assertion',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'comment-after-assertion',
      description: 'a justification comment placed after its assertion',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'comment-on-unrelated-statement',
      description: 'a justification attached to a different statement',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'angle-bracket-without-comment',
      description: 'an angle-bracket assertion without a justification',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
  ],
});
