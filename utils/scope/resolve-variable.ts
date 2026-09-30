// Objective: Resolve an identifier to its lexical binding. Used by rules that inspect references.

import type { ESTree, Scope, SourceCode, Variable } from '@oxlint/plugins';

type ResolveVariableInput = {
  readonly sourceCode: SourceCode;
  readonly identifier: ESTree.IdentifierReference;
};

/** Resolve an identifier to its binding by walking lexical scopes upward. */
export const resolveVariable = ({
  sourceCode,
  identifier,
}: ResolveVariableInput): Variable | null => {
  let scope: Scope | null = sourceCode.getScope(identifier);

  while (scope !== null) {
    const variable = scope.set.get(identifier.name);

    if (variable !== undefined) return variable;
    scope = scope.upper;
  }

  return null;
};
