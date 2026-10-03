// Objective: Verify reducer accumulator copy diagnostics. Used when testing no-reduce-accumulator-copy.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noReduceAccumulatorCopy;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'copying-reducer-accumulator',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'mutating-reducer-accumulator', expectedCode: null },
    { name: 'reduce-right-copy', expectedCode: `anti-slop(${RULE_NAME})` },
    {
      name: 'const-accumulator-alias',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'object-assign-copy', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'array-from-copy', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'computed-slice-copy', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'object-assign-mutation', expectedCode: null },
    { name: 'copy-current-item', expectedCode: null },
    { name: 'shadowed-object-global', expectedCode: null },
    { name: 'string-accumulator', expectedCode: null },
  ],
});
