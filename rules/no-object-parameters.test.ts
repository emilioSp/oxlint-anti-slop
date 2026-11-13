// Objective: Verify broad object parameter diagnostics. Used when testing no-object-parameters.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noObjectParameters;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'broad-object-parameter',
      description: 'a function parameter typed as object',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'named-domain-parameter',
      description: 'a function parameter typed with a named domain type',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'aliased-object',
      description: 'a function parameter typed with an alias for object',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'nullable-object',
      description: 'an arrow parameter typed as object or null',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'defaulted-object',
      description: 'an object parameter with a default value',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'function-type-parameter',
      description: 'a function type with an object parameter',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'constructor-parameter-property',
      description: 'an object-typed constructor parameter property',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'unknown-boundary',
      description: 'an unknown function parameter',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'object-generic-constraint',
      description: 'a generic parameter constrained to object',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'shadowed-alias',
      description: 'a generic parameter shadowing an object alias',
      expectedExitCode: 0,
      expectedCodes: [],
    },
  ],
});
