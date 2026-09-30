// Objective: Recognize local array evidence without evaluating code. Used by reducer copy checks.

import type { ESTree, SourceCode, Variable } from '@oxlint/plugins';

import { arrayMethodTarget } from '#utils/array-methods/array-method-target.js';
import { resolveArrayBinding } from '#utils/array-methods/resolve-array-binding.js';
import { unwrapArrayExpression } from '#utils/array-methods/unwrap-array-expression.js';

const NODE_TYPES = {
  arrayType: 'TSArrayType',
  tupleType: 'TSTupleType',
  parenthesizedType: 'TSParenthesizedType',
  typeOperator: 'TSTypeOperator',
  typeReference: 'TSTypeReference',
  identifier: 'Identifier',
  arrayExpression: 'ArrayExpression',
  callExpression: 'CallExpression',
  variable: 'Variable',
  variableDeclarator: 'VariableDeclarator',
  variableDeclaration: 'VariableDeclaration',
} as const;

const TYPE_NAMES = {
  array: 'Array',
  readonlyArray: 'ReadonlyArray',
  readonlyOperator: 'readonly',
} as const;

const ARRAY_METHOD_NAMES = {
  map: 'map',
  filter: 'filter',
  flatMap: 'flatMap',
  slice: 'slice',
  concat: 'concat',
  toSorted: 'toSorted',
  toReversed: 'toReversed',
  toSpliced: 'toSpliced',
} as const;

const ARRAY_METHODS: ReadonlySet<string> = new Set(
  Object.values(ARRAY_METHOD_NAMES),
);

const DECLARATION_KINDS = {
  constant: 'const',
} as const;

const isArrayAnnotation = (type: ESTree.TSType): boolean => {
  if (type.type === NODE_TYPES.arrayType || type.type === NODE_TYPES.tupleType)
    return true;

  if (type.type === NODE_TYPES.parenthesizedType)
    return isArrayAnnotation(type.typeAnnotation);

  if (
    type.type === NODE_TYPES.typeOperator &&
    type.operator === TYPE_NAMES.readonlyOperator
  ) {
    return isArrayAnnotation(type.typeAnnotation);
  }

  return (
    type.type === NODE_TYPES.typeReference &&
    type.typeName.type === NODE_TYPES.identifier &&
    (type.typeName.name === TYPE_NAMES.array ||
      type.typeName.name === TYPE_NAMES.readonlyArray)
  );
};

type IsKnownArrayExpressionInput = {
  readonly sourceCode: SourceCode;
  readonly node: ESTree.Node;
  readonly visited?: Set<Variable>;
};

/** Recognize local array evidence; unknown receivers and iterator pipelines are deliberately excluded. */
export const isKnownArrayExpression = ({
  sourceCode,
  node: inputNode,
  visited = new Set<Variable>(),
}: IsKnownArrayExpressionInput): boolean => {
  const node = unwrapArrayExpression(inputNode);

  if (node.type === NODE_TYPES.arrayExpression) return true;

  if (node.type === NODE_TYPES.callExpression) {
    const method = arrayMethodTarget(node.callee);

    return (
      method !== null &&
      ARRAY_METHODS.has(method.name) &&
      isKnownArrayExpression({
        sourceCode,
        node: method.object,
        visited,
      })
    );
  }

  if (node.type !== NODE_TYPES.identifier) return false;
  const variable = resolveArrayBinding({ sourceCode, node });

  if (variable === null || visited.has(variable)) return false;
  visited.add(variable);

  if (
    variable.references.some(
      (reference) => reference.isWrite() && !reference.init,
    )
  )
    return false;

  for (const identifier of variable.identifiers) {
    const annotation = identifier.typeAnnotation?.typeAnnotation;

    if (annotation !== undefined) return isArrayAnnotation(annotation);
  }

  for (const definition of variable.defs) {
    if (
      definition.type === NODE_TYPES.variable &&
      definition.node.type === NODE_TYPES.variableDeclarator &&
      definition.node.id.type === NODE_TYPES.identifier &&
      definition.node.init !== null &&
      definition.node.parent.type === NODE_TYPES.variableDeclaration &&
      definition.node.parent.kind === DECLARATION_KINDS.constant
    ) {
      return isKnownArrayExpression({
        sourceCode,
        node: definition.node.init,
        visited,
      });
    }
  }

  return false;
};
