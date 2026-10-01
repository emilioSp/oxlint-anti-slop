// Objective: Verify unsafe dictionary value diagnostics. Used when testing no-unsafe-dictionary-values.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-unsafe-dictionary-values';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
