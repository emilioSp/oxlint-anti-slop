// Objective: Unwrap syntax-only expression wrappers. Used by the array-analysis rules.

import type { ESTree } from '@oxlint/plugins';

const NODE_TYPES = {
  parenthesizedExpression: 'ParenthesizedExpression',
  chainExpression: 'ChainExpression',
  asExpression: 'TSAsExpression',
  typeAssertion: 'TSTypeAssertion',
  nonNullExpression: 'TSNonNullExpression',
  satisfiesExpression: 'TSSatisfiesExpression',
} as const;

/** Unwrap syntax-only wrappers when inspecting array expressions. */
export const unwrapArrayExpression = (node: ESTree.Node): ESTree.Node => {
  while (
    node.type === NODE_TYPES.parenthesizedExpression ||
    node.type === NODE_TYPES.chainExpression ||
    node.type === NODE_TYPES.asExpression ||
    node.type === NODE_TYPES.typeAssertion ||
    node.type === NODE_TYPES.nonNullExpression ||
    node.type === NODE_TYPES.satisfiesExpression
  ) {
    node = node.expression;
  }

  return node;
};
