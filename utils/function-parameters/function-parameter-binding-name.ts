// Objective: Read a function parameter's local binding name. Used in rule diagnostics.

import type { SourceCode } from '@oxlint/plugins';

import type { FunctionParameter } from '#utils/function-parameters/types.js';

const PARAMETER_TYPES = {
  parameterProperty: 'TSParameterProperty',
  assignmentPattern: 'AssignmentPattern',
  restElement: 'RestElement',
  identifier: 'Identifier',
} as const;

type FunctionParameterBindingNameInput = {
  readonly parameter: FunctionParameter;
  readonly sourceCode: SourceCode;
};

/** Return only a function parameter's local binding, excluding its annotation and default value. */
export const functionParameterBindingName = ({
  parameter,
  sourceCode,
}: FunctionParameterBindingNameInput): string => {
  if (parameter.type === PARAMETER_TYPES.parameterProperty) {
    return functionParameterBindingName({
      parameter: parameter.parameter,
      sourceCode,
    });
  }

  if (parameter.type === PARAMETER_TYPES.assignmentPattern) {
    return functionParameterBindingName({
      parameter: parameter.left,
      sourceCode,
    });
  }

  if (parameter.type === PARAMETER_TYPES.restElement) {
    return functionParameterBindingName({
      parameter: parameter.argument,
      sourceCode,
    });
  }

  if (parameter.type === PARAMETER_TYPES.identifier) return parameter.name;

  const sourceText = sourceCode.getText(parameter);
  const annotationStart = parameter.typeAnnotation?.start;

  return annotationStart === undefined
    ? sourceText
    : sourceText.slice(0, annotationStart - parameter.start).trimEnd();
};
