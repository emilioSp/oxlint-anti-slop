// Objective: Read static member names from array-like expressions. Used by array rule matching.

import type { ESTree } from '@oxlint/plugins';

import { unwrapArrayExpression } from '#utils/array-methods/unwrap-array-expression.js';

type StringLiteral = ESTree.StringLiteral;

const NODE_TYPES = {
  literal: 'Literal',
  memberExpression: 'MemberExpression',
  identifier: 'Identifier',
} as const;

const isStringLiteral = (node: ESTree.Node): node is StringLiteral => {
  return node.type === NODE_TYPES.literal && typeof node.value === 'string';
};

/** Read static method names, including computed string literals, without evaluating expressions. */
export const arrayMethodTarget = (
  node: ESTree.Node,
): { readonly name: string; readonly object: ESTree.Node } | null => {
  node = unwrapArrayExpression(node);

  if (node.type !== NODE_TYPES.memberExpression) return null;
  const property = node.property;

  if (!node.computed && property.type === NODE_TYPES.identifier) {
    return { name: property.name, object: node.object };
  }

  if (node.computed && isStringLiteral(property)) {
    return { name: property.value, object: node.object };
  }

  return null;
};
