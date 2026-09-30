// Objective: Reject broad object function parameters. Used during TypeScript linting.

import type { ESTree } from '@oxlint/plugins';
import { defineRule } from '@oxlint/plugins';

import { functionParameterBindingName } from '#utils/function-parameters/function-parameter-binding-name.js';
import { functionParameterTypeAnnotation } from '#utils/function-parameters/function-parameter-type-annotation.js';
import { createTypeAliasEnvironment } from '#utils/type-alias-resolution/create-type-alias-environment.js';
import { resolvedTypeMatches } from '#utils/type-alias-resolution/resolved-type-matches.js';
import type { TypeAliasEnvironment } from '#utils/type-alias-resolution/types.js';

const NODE_TYPES = {
  objectKeyword: 'TSObjectKeyword',
  parenthesizedType: 'TSParenthesizedType',
  unionType: 'TSUnionType',
} as const;

const MESSAGE_IDS = {
  objectParameter: 'objectParameter',
} as const;

type ParameterOwner =
  | ESTree.ArrowFunctionExpression
  | ESTree.Function
  | ESTree.TSCallSignatureDeclaration
  | ESTree.TSConstructSignatureDeclaration
  | ESTree.TSConstructorType
  | ESTree.TSFunctionType
  | ESTree.TSMethodSignature;

/** Ban the broad object type on function inputs, including local aliases to object. */
export const noObjectParametersRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow object function parameters; inputs must use an owner-provided type and be parsed at their boundary.',
    },
    messages: {
      [MESSAGE_IDS.objectParameter]:
        'Parameter `{{parameter}}` uses the broad `object` type, which does not describe its properties. Use a named type for the expected value, or validate external input before passing it here.',
    },
  },
  createOnce: (context) => {
    let environment: TypeAliasEnvironment | null = null;

    const resolvesToObject = (type: ESTree.TSType): boolean =>
      environment !== null &&
      resolvedTypeMatches({
        type,
        environment,
        matcher: ({ type: resolved, matches }) => {
          if (resolved.type === NODE_TYPES.objectKeyword) return true;

          if (resolved.type === NODE_TYPES.parenthesizedType) {
            return matches(resolved.typeAnnotation);
          }

          return (
            resolved.type === NODE_TYPES.unionType &&
            resolved.types.some(matches)
          );
        },
      });

    const checkParameters = (node: ParameterOwner) => {
      for (const parameter of node.params) {
        const annotation = functionParameterTypeAnnotation(parameter);

        if (annotation === null || annotation === undefined) continue;

        if (!resolvesToObject(annotation.typeAnnotation)) continue;
        context.report({
          node: annotation.typeAnnotation,
          messageId: MESSAGE_IDS.objectParameter,
          data: {
            parameter: functionParameterBindingName({
              parameter,
              sourceCode: context.sourceCode,
            }),
          },
        });
      }
    };

    return {
      Program: (node) => {
        environment = createTypeAliasEnvironment({
          program: node,
          visitorKeys: context.sourceCode.visitorKeys,
        });
      },
      ArrowFunctionExpression: checkParameters,
      FunctionDeclaration: checkParameters,
      FunctionExpression: checkParameters,
      TSCallSignatureDeclaration: checkParameters,
      TSConstructSignatureDeclaration: checkParameters,
      TSConstructorType: checkParameters,
      TSDeclareFunction: checkParameters,
      TSEmptyBodyFunctionExpression: checkParameters,
      TSFunctionType: checkParameters,
      TSMethodSignature: checkParameters,
    };
  },
});
