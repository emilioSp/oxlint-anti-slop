// Objective: Verify type assertion justification diagnostics. Used when testing require-justification-comment-for-type-assertion.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'require-justification-comment-for-type-assertion';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
