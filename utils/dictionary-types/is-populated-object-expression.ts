// Objective: Detect object expressions with meaningful members. Used by widening rules.

import type { ESTree } from '@oxlint/plugins';

import { DICTIONARY_NODE_TYPES } from '#utils/dictionary-types/types.js';

/** Return whether an expression is a non-empty object after syntax wrappers are removed. */
export const isPopulatedObjectExpression = (
  expression: ESTree.Expression,
): boolean => {
  let current = expression;

  while (
    current.type === DICTIONARY_NODE_TYPES.parenthesizedExpression ||
    current.type === DICTIONARY_NODE_TYPES.asExpression ||
    current.type === DICTIONARY_NODE_TYPES.typeAssertion ||
    current.type === DICTIONARY_NODE_TYPES.nonNullExpression
  ) {
    current = current.expression;
  }

  return (
    current.type === DICTIONARY_NODE_TYPES.objectExpression &&
    current.properties.length > 0
  );
};
