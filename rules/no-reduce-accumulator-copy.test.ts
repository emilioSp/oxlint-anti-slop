// Objective: Verify reducer accumulator copy diagnostics. Used when testing no-reduce-accumulator-copy.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noReduceAccumulatorCopy;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'copying-reducer-accumulator',
      description: 'a reducer concatenating its array accumulator',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'mutating-reducer-accumulator',
      description: 'a reducer pushing into its locally owned accumulator',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'reduce-right-copy',
      description: 'a reduceRight callback concatenating its accumulator',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'const-accumulator-alias',
      description: 'concat on a const alias of the accumulator',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'object-assign-copy',
      description: 'Object.assign copying an accumulator to a new object',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'array-from-copy',
      description: 'a reducer copying its accumulator with Array.from',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'computed-slice-copy',
      description: 'an accumulator copied through computed slice',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'object-assign-mutation',
      description: 'an accumulator mutated with Object.assign',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'copy-current-item',
      description: 'a reducer copying its item, not its accumulator',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'shadowed-object-global',
      description: 'a reducer calling assign on a local object named Object',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'string-accumulator',
      description: 'a reducer concatenating a string accumulator',
      expectedExitCode: 0,
      expectedCodes: [],
    },
  ],
});
