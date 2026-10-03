// Objective: Read a function parameter's type annotation. Used by parameter and widening rules.

import type { ESTree } from '@oxlint/plugins';

import type { FunctionParameter } from '#utils/function-parameters/types.js';

const PARAMETER_TYPES = {
  parameterProperty: 'TSParameterProperty',
  restElement: 'RestElement',
  assignmentPattern: 'AssignmentPattern',
} as const;

/** Return the TypeScript annotation attached to a function parameter or its wrapped binding. */
export const functionParameterTypeAnnotation = (
  parameter: FunctionParameter,
): ESTree.TSTypeAnnotation | null | undefined => {
  if (parameter.type === PARAMETER_TYPES.parameterProperty) {
    return functionParameterTypeAnnotation(parameter.parameter);
  }

  if (parameter.type === PARAMETER_TYPES.restElement) {
    return (
      parameter.typeAnnotation ??
      functionParameterTypeAnnotation(parameter.argument)
    );
  }

  if (parameter.type === PARAMETER_TYPES.assignmentPattern) {
    return (
      parameter.typeAnnotation ??
      functionParameterTypeAnnotation(parameter.left)
    );
  }

  return parameter.typeAnnotation;
};
