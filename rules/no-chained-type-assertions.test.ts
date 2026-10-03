// Objective: Verify chained type assertion diagnostics. Used when testing no-chained-type-assertions.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noChainedTypeAssertions;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'chained-type-assertion', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'parenthesized-chain', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'angle-bracket-chain', expectedCode: `anti-slop(${RULE_NAME})` },
    {
      name: 'triple-chain-reported-once',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'const-then-domain-assertion',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'const-assertion', expectedCode: null },
    { name: 'independent-assertions', expectedCode: null },
  ],
});
