// Objective: Verify meaningless unknown alias diagnostics. Used when testing no-meaningless-unknown-aliases.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-meaningless-unknown-aliases';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
    { name: 'unknown-union', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'parenthesized-unknown', expectedCode: `anti-slop(${RULE_NAME})` },
    {
      name: 'generic-alias-instantiation',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'unknown-property', expectedCode: null },
    { name: 'unknown-array', expectedCode: null },
    { name: 'unknown-intersection', expectedCode: null },
  ],
});
