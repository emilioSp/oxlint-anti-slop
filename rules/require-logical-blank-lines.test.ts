// Objective: Verify logical blank-line diagnostics. Used when testing require-logical-blank-lines.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.requireLogicalBlankLines;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'missing-logical-blank-lines',
      description: 'a type declaration immediately followed by a function',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'logical-blank-lines',
      description: 'logically separated imports and declarations',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'adjacent-overloads',
      description: 'adjacent function overloads and their implementation',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'adjacent-local-bindings',
      description: 'adjacent single-line local bindings',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'missing-line-after-import',
      description: 'an import immediately followed by an exported binding',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'missing-line-before-return',
      description: 'a local binding immediately followed by a return',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'missing-line-after-multiline-binding',
      description: 'a multiline binding immediately followed by a statement',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'comment-is-not-blank-line',
      description: 'a binding and return separated only by a comment',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
  ],
});
