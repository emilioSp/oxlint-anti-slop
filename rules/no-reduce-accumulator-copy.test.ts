// Objective: Verify reducer accumulator copy diagnostics. Used when testing no-reduce-accumulator-copy.

import { testRule } from '#test/rule-test';

const RULE_NAME = 'no-reduce-accumulator-copy';

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    { name: 'invalid', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'valid', expectedCode: null },
  ],
});
