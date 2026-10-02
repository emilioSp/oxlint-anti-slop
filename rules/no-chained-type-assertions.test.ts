// Objective: Verify chained type assertion diagnostics. Used when testing no-chained-type-assertions.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-chained-type-assertions';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
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
