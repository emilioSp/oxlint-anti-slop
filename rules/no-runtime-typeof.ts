// Objective: Reject unsafe runtime typeof checks. Used during TypeScript linting.

import type { ESTree } from '@oxlint/plugins';
import { defineRule } from '@oxlint/plugins';

type RuntimeFunction = ESTree.ArrowFunctionExpression | ESTree.Function;

const NODE_TYPES = {
  arrowFunction: 'ArrowFunctionExpression',
  functionDeclaration: 'FunctionDeclaration',
  functionExpression: 'FunctionExpression',
  program: 'Program',
  binaryExpression: 'BinaryExpression',
  literal: 'Literal',
  typePredicate: 'TSTypePredicate',
} as const;

const OPERATORS = {
  typeof: 'typeof',
} as const;

const GLOBAL_NAMES = {
  undefined: 'undefined',
} as const;

const MESSAGE_IDS = {
  runtimeTypeof: 'runtimeTypeof',
} as const;

const EXISTENCE_OPERATOR_NAMES = {
  strictEqual: '===',
  strictNotEqual: '!==',
  looseEqual: '==',
  looseNotEqual: '!=',
} as const;

const EXISTENCE_OPERATORS: ReadonlySet<string> = new Set(
  Object.values(EXISTENCE_OPERATOR_NAMES),
);

const isRuntimeFunction = (node: ESTree.Node): node is RuntimeFunction => {
  return (
    node.type === NODE_TYPES.arrowFunction ||
    node.type === NODE_TYPES.functionDeclaration ||
    node.type === NODE_TYPES.functionExpression
  );
};

const isInsideTypeGuard = (node: ESTree.Node): boolean => {
  let current: ESTree.Node | null = node.parent;

  while (current !== null && current.type !== NODE_TYPES.program) {
    if (isRuntimeFunction(current)) {
      return (
        current.returnType?.typeAnnotation.type === NODE_TYPES.typePredicate
      );
    }

    current = current.parent;
  }

  return false;
};

/** Return whether typeof safely probes for the existence of a possibly absent binding. */
const isExistenceProbe = (node: ESTree.UnaryExpression): boolean => {
  const parent = node.parent;

  if (parent.type !== NODE_TYPES.binaryExpression) return false;

  if (!EXISTENCE_OPERATORS.has(parent.operator)) return false;
  const other = parent.left === node ? parent.right : parent.left;

  return (
    other.type === NODE_TYPES.literal && other.value === GLOBAL_NAMES.undefined
  );
};

/** Disallow runtime typeof checks that narrow unparsed values instead of decoding them. */
export const noRuntimeTypeofRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow runtime typeof checks; external values must be decoded into meaningful types at their I/O boundary.',
    },
    messages: {
      [MESSAGE_IDS.runtimeTypeof]:
        'Do not use `typeof` here as an inline type check. Validate the value in a named type guard. For external input, parse it at the input boundary, then use the validated domain value. `typeof` is allowed inside type guards.',
    },
  },
  createOnce: (context) => {
    return {
      UnaryExpression: (node) => {
        if (
          node.operator === OPERATORS.typeof &&
          !isExistenceProbe(node) &&
          !isInsideTypeGuard(node)
        ) {
          context.report({ node, messageId: MESSAGE_IDS.runtimeTypeof });
        }
      },
    };
  },
});
