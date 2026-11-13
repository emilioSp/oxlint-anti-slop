// Objective: Verify unsafe dictionary value diagnostics. Used when testing no-unsafe-dictionary-values.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noUnsafeDictionaryValues;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'any-dictionary-value',
      description: 'an any-valued dictionary alias used several times',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'concrete-dictionary-value',
      description: 'a dictionary with named structured values',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'object-value',
      description: 'a dictionary with object values',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'empty-object-value',
      description: 'a dictionary with empty-object values',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'unsafe-union-value',
      description: 'a dictionary value union containing object',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'generic-alias-value',
      description: 'a generic dictionary alias instantiated with any',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'interface-index-signature',
      description: 'an interface index signature with object values',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'mapped-type-value',
      description: 'a mapped dictionary type with any values',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'unknown-value',
      description: 'a dictionary with unknown values',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'never-value',
      description: 'a dictionary with never values',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'generic-constraint',
      description: 'an unsafe dictionary used only as a generic constraint',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'shadowed-record',
      description: 'a local Record type that is not a dictionary',
      expectedExitCode: 0,
      expectedCodes: [],
    },
  ],
});
