// Objective: Verify type assertion justification diagnostics. Used when testing require-type-assertion-justification.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'require-type-assertion-justification';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
