// Objective: Verify chained type assertion diagnostics. Used when testing no-chained-type-assertions.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noChainedTypeAssertions;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'chained-type-assertion',
      description: 'a payload asserted through unknown to a domain type',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'parenthesized-chain',
      description: 'a parenthesized assertion chain',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'angle-bracket-chain',
      description: 'an angle-bracket assertion chain',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'triple-chain-reported-once',
      description: 'three chained type assertions',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'const-then-domain-assertion',
      description: 'a const assertion followed by a domain assertion',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'const-assertion',
      description: 'a standalone const assertion',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'independent-assertions',
      description: 'two independent type assertions',
      expectedExitCode: 0,
      expectedCodes: [],
    },
  ],
});
