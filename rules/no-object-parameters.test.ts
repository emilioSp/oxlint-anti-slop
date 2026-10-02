// Objective: Verify broad object parameter diagnostics. Used when testing no-object-parameters.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-object-parameters';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
    { name: 'aliased-object', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'nullable-object', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'defaulted-object', expectedCode: `anti-slop(${RULE_NAME})` },
    {
      name: 'function-type-parameter',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'constructor-parameter-property',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'unknown-boundary', expectedCode: null },
    { name: 'object-generic-constraint', expectedCode: null },
    { name: 'shadowed-alias', expectedCode: null },
  ],
});
