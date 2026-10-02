// Objective: Verify logical blank-line diagnostics. Used when testing require-logical-blank-lines.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'require-logical-blank-lines';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
    { name: 'adjacent-overloads', expectedCode: null },
    { name: 'adjacent-local-bindings', expectedCode: null },
    {
      name: 'missing-line-after-import',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'missing-line-before-return',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'missing-line-after-multiline-binding',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'comment-is-not-blank-line',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
  ],
});
