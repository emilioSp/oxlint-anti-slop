// Objective: Verify unnecessary type widening diagnostics. Used when testing no-unnecessary-type-widening.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noUnnecessaryTypeWidening;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'generic-dictionary-widening',
      description: 'a known object assigned to a generic dictionary',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'named-domain-type',
      description: 'a known object assigned to a named domain type',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'known-object-to-unknown',
      description: 'a known object annotated as unknown',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'aliased-broad-type',
      description: 'a known object annotated with an alias for object',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'anonymous-object-annotation',
      description: 'an object with a repeated anonymous annotation',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'assignment-to-broad-binding',
      description: 'a known object assigned to an unknown binding',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'broad-return-type',
      description: 'a known object returned with an object annotation',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'broad-arrow-return',
      description: 'an arrow returning a known object as unknown',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'broad-class-property',
      description: 'a known object stored in an object-typed class property',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'broad-type-assertion',
      description: 'a known object asserted to object',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'known-argument-to-guard',
      description: 'a known string passed to an unknown guard input',
      expectedExitCode: 1,
      expectedCodes: [`anti-slop(${RULE_NAME})`],
    },
    {
      name: 'empty-dictionary-accumulator',
      description: 'an empty object initializing a generic dictionary',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'finite-record-keys',
      description: 'an object annotated as a Record with a finite key set',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'external-input-to-unknown',
      description: 'external JSON stored as unknown',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'unknown-argument-to-guard',
      description: 'an unknown value passed to an unknown guard input',
      expectedExitCode: 0,
      expectedCodes: [],
    },
    {
      name: 'satisfies-named-contract',
      description: 'an object satisfying a named contract',
      expectedExitCode: 0,
      expectedCodes: [],
    },
  ],
});
