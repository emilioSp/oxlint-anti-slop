// Objective: Identify calls to global Reflect methods. Used by reflection-sensitive rules.

import type { ESTree, SourceCode } from '@oxlint/plugins';

import { resolveVariable } from '#utils/scope/resolve-variable.js';

const NODE_TYPES = {
  identifier: 'Identifier',
  literal: 'Literal',
} as const;

const GLOBAL_NAMES = {
  reflect: 'Reflect',
} as const;

type IsGlobalReflectInput = {
  readonly sourceCode: SourceCode;
  readonly expression: ESTree.Expression;
};

const isGlobalReflect = ({
  sourceCode,
  expression,
}: IsGlobalReflectInput): boolean => {
  if (
    expression.type !== NODE_TYPES.identifier ||
    expression.name !== GLOBAL_NAMES.reflect
  )
    return false;

  if (sourceCode.isGlobalReference(expression)) return true;
  const variable = resolveVariable({ sourceCode, identifier: expression });

  return variable === null || variable.defs.length === 0;
};

type IsGlobalReflectMethodCallInput = {
  readonly sourceCode: SourceCode;
  readonly callee: ESTree.Expression;
  readonly methodName: string;
};

/** Reports whether a call target names one method on the global Reflect object. */
export const isGlobalReflectMethodCall = ({
  sourceCode,
  callee,
  methodName,
}: IsGlobalReflectMethodCallInput): boolean => {
  if (
    !('property' in callee) ||
    !('object' in callee) ||
    !('computed' in callee)
  )
    return false;

  if (!isGlobalReflect({ sourceCode, expression: callee.object })) return false;
  const property = callee.property;

  return callee.computed
    ? property.type === NODE_TYPES.literal && property.value === methodName
    : property.type === NODE_TYPES.identifier && property.name === methodName;
};
