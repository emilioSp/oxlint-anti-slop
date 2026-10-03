// Objective: Verify meaningless unknown alias diagnostics. Used when testing no-meaningless-unknown-aliases.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noMeaninglessUnknownAliases;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'unknown-alias', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'validated-webhook-boundary', expectedCode: null },
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
