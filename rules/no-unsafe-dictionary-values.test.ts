// Objective: Verify unsafe dictionary value diagnostics. Used when testing no-unsafe-dictionary-values.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-unsafe-dictionary-values';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
    { name: 'object-value', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'empty-object-value', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'unsafe-union-value', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'generic-alias-value', expectedCode: `anti-slop(${RULE_NAME})` },
    {
      name: 'interface-index-signature',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'mapped-type-value', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'unknown-value', expectedCode: null },
    { name: 'never-value', expectedCode: null },
    { name: 'generic-constraint', expectedCode: null },
    { name: 'shadowed-record', expectedCode: null },
  ],
});
