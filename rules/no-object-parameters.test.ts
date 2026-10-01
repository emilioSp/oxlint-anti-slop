// Objective: Verify broad object parameter diagnostics. Used when testing no-object-parameters.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-object-parameters';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
