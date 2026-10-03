// Objective: Resolve array-analysis identifiers to lexical bindings. Used by array evidence checks.

import type { ESTree, SourceCode, Variable } from '@oxlint/plugins';

import { unwrapArrayExpression } from '#utils/array-methods/unwrap-array-expression.js';
import { resolveVariable } from '#utils/scope/resolve-variable.js';

const NODE_TYPES = {
  identifier: 'Identifier',
} as const;

type ResolveArrayBindingInput = {
  readonly sourceCode: SourceCode;
  readonly node: ESTree.Node;
};

/** Resolve a local binding by scope, not by identifier spelling. */
export const resolveArrayBinding = ({
  sourceCode,
  node: inputNode,
}: ResolveArrayBindingInput): Variable | null => {
  const node = unwrapArrayExpression(inputNode);

  if (node.type !== NODE_TYPES.identifier) return null;

  return resolveVariable({ sourceCode, identifier: node });
};
