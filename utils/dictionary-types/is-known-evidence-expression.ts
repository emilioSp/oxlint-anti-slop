// Objective: Detect expressions with statically known evidence. Used by widening rules.

import type { ESTree } from '@oxlint/plugins';

import { DICTIONARY_NODE_TYPES } from '#utils/dictionary-types/types.js';

/** Return whether an expression has a directly known runtime shape. */
export const isKnownEvidenceExpression = (
  expression: ESTree.Expression,
): boolean => {
  let current = expression;

  while (
    current.type === DICTIONARY_NODE_TYPES.parenthesizedExpression ||
    current.type === DICTIONARY_NODE_TYPES.asExpression ||
    current.type === DICTIONARY_NODE_TYPES.typeAssertion ||
    current.type === DICTIONARY_NODE_TYPES.nonNullExpression ||
    current.type === DICTIONARY_NODE_TYPES.satisfiesExpression
  ) {
    current = current.expression;
  }

  if (current.type === DICTIONARY_NODE_TYPES.objectExpression) return true;

  return (
    current.type === DICTIONARY_NODE_TYPES.arrayExpression ||
    current.type === DICTIONARY_NODE_TYPES.arrowFunction ||
    current.type === DICTIONARY_NODE_TYPES.classExpression ||
    current.type === DICTIONARY_NODE_TYPES.functionExpression ||
    current.type === DICTIONARY_NODE_TYPES.newExpression ||
    current.type === DICTIONARY_NODE_TYPES.literal ||
    current.type === DICTIONARY_NODE_TYPES.templateLiteral ||
    current.type === DICTIONARY_NODE_TYPES.unaryExpression
  );
};
