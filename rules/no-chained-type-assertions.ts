// Objective: Reject chained TypeScript assertions. Used during TypeScript linting.

import type { ESTree } from '@oxlint/plugins';
import { defineRule } from '@oxlint/plugins';

type TypeAssertionExpression = ESTree.TSAsExpression | ESTree.TSTypeAssertion;

const NODE_TYPES = {
  asExpression: 'TSAsExpression',
  typeAssertion: 'TSTypeAssertion',
  parenthesizedExpression: 'ParenthesizedExpression',
  typeReference: 'TSTypeReference',
  identifier: 'Identifier',
} as const;

const MESSAGE_IDS = {
  chained: 'chained',
} as const;

const TYPE_NAMES = {
  constAssertion: 'const',
} as const;

const isTypeAssertionExpression = (
  node: ESTree.Node,
): node is TypeAssertionExpression => {
  return (
    node.type === NODE_TYPES.asExpression ||
    node.type === NODE_TYPES.typeAssertion
  );
};

const unwrapParenthesizedExpression = (
  expression: ESTree.Expression,
): ESTree.Expression => {
  let current = expression;

  while (current.type === NODE_TYPES.parenthesizedExpression) {
    current = current.expression;
  }

  return current;
};

const isConstAssertion = (node: TypeAssertionExpression): boolean => {
  const { typeAnnotation } = node;

  return (
    typeAnnotation.type === NODE_TYPES.typeReference &&
    typeAnnotation.typeName.type === NODE_TYPES.identifier &&
    typeAnnotation.typeName.name === TYPE_NAMES.constAssertion
  );
};

const isOutermostAssertionInChain = (
  node: TypeAssertionExpression,
): boolean => {
  let current: ESTree.Expression = node;
  let parent = node.parent;

  while (
    parent.type === NODE_TYPES.parenthesizedExpression &&
    parent.expression === current
  ) {
    current = parent;
    parent = parent.parent;
  }

  return !isTypeAssertionExpression(parent) || parent.expression !== current;
};

const isForbiddenAssertionChain = (node: TypeAssertionExpression): boolean => {
  let assertionCount = 0;
  let hasNonConstAssertion = false;
  let current: ESTree.Expression = node;

  while (isTypeAssertionExpression(current)) {
    assertionCount += 1;
    hasNonConstAssertion ||= !isConstAssertion(current);
    current = unwrapParenthesizedExpression(current.expression);
  }

  return assertionCount > 1 && hasNonConstAssertion;
};

/** Disallow nested TypeScript type assertions, while permitting chains made only of const assertions. */
export const noChainedTypeAssertionsRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow chained TypeScript as and angle-bracket assertions, including parenthesized chains.',
    },
    messages: {
      [MESSAGE_IDS.chained]:
        'Do not chain type assertions. Keep the original type, or validate external input with a named type guard before using the domain type.',
    },
  },
  createOnce: (context) => {
    const checkTypeAssertion = (node: TypeAssertionExpression) => {
      if (
        !isOutermostAssertionInChain(node) ||
        !isForbiddenAssertionChain(node)
      )
        return;
      context.report({ node, messageId: MESSAGE_IDS.chained });
    };

    return {
      TSAsExpression: checkTypeAssertion,
      TSTypeAssertion: checkTypeAssertion,
    };
  },
});
