// Objective: Verify unnecessary type widening diagnostics. Used when testing no-unnecessary-type-widening.

import { RULE_NAMES } from '#rules/rule-names.js';
import { testRule } from '#test/rule-test';

const RULE_NAME = RULE_NAMES.noUnnecessaryTypeWidening;

testRule({
  ruleName: RULE_NAME,
  fixtures: [
    {
      name: 'generic-dictionary-widening',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'named-domain-type', expectedCode: null },
    {
      name: 'known-object-to-unknown',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'aliased-broad-type', expectedCode: `anti-slop(${RULE_NAME})` },
    {
      name: 'anonymous-object-annotation',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    {
      name: 'assignment-to-broad-binding',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'broad-return-type', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'broad-arrow-return', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'broad-class-property', expectedCode: `anti-slop(${RULE_NAME})` },
    { name: 'broad-type-assertion', expectedCode: `anti-slop(${RULE_NAME})` },
    {
      name: 'known-argument-to-guard',
      expectedCode: `anti-slop(${RULE_NAME})`,
    },
    { name: 'empty-dictionary-accumulator', expectedCode: null },
    { name: 'finite-record-keys', expectedCode: null },
    { name: 'external-input-to-unknown', expectedCode: null },
    { name: 'unknown-argument-to-guard', expectedCode: null },
    { name: 'satisfies-named-contract', expectedCode: null },
  ],
});
