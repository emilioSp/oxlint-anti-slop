// Objective: Resolve array-analysis identifiers to lexical bindings. Used by array evidence checks.

import type { ESTree, Scope, SourceCode, Variable } from '@oxlint/plugins';

import { unwrapArrayExpression } from '#utils/array-methods/unwrap-array-expression.js';

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
  let scope: Scope | null = sourceCode.getScope(node);

  while (scope !== null) {
    const variable = scope.set.get(node.name);

    if (variable !== undefined) return variable;
    scope = scope.upper;
  }

  return null;
};
