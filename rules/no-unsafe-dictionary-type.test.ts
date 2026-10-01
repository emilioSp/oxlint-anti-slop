// Objective: Verify unsafe dictionary diagnostics. Used when testing no-unsafe-dictionary-type.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-unsafe-dictionary-type';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
