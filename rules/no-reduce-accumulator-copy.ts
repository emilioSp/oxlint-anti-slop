// Objective: Reject repeated reducer accumulator copies. Used during TypeScript linting.

import type { ESTree, SourceCode, Variable } from '@oxlint/plugins';
import { defineRule } from '@oxlint/plugins';

import { arrayMethodTarget } from '#utils/array-methods/array-method-target.js';
import { isKnownArrayExpression } from '#utils/array-methods/is-known-array-expression.js';
import { resolveArrayBinding } from '#utils/array-methods/resolve-array-binding.js';
import { unwrapArrayExpression } from '#utils/array-methods/unwrap-array-expression.js';

const NODE_TYPES = {
  functionDeclaration: 'FunctionDeclaration',
  arrowFunction: 'ArrowFunctionExpression',
  functionExpression: 'FunctionExpression',
  callExpression: 'CallExpression',
  assignmentPattern: 'AssignmentPattern',
  identifier: 'Identifier',
  variable: 'Variable',
  variableDeclarator: 'VariableDeclarator',
  variableDeclaration: 'VariableDeclaration',
  objectExpression: 'ObjectExpression',
} as const;

const METHOD_NAMES = {
  reduce: 'reduce',
  reduceRight: 'reduceRight',
  assign: 'assign',
  from: 'from',
  concat: 'concat',
  slice: 'slice',
  toSpliced: 'toSpliced',
  toSorted: 'toSorted',
  toReversed: 'toReversed',
  with: 'with',
} as const;

const REDUCE_METHODS: ReadonlySet<string> = new Set([
  METHOD_NAMES.reduce,
  METHOD_NAMES.reduceRight,
]);

const ARRAY_COPY_METHODS: ReadonlySet<string> = new Set([
  METHOD_NAMES.concat,
  METHOD_NAMES.slice,
  METHOD_NAMES.toSpliced,
  METHOD_NAMES.toSorted,
  METHOD_NAMES.toReversed,
  METHOD_NAMES.with,
]);

const GLOBAL_COPY_OWNERS = {
  object: 'Object',
  array: 'Array',
} as const;

const MESSAGE_IDS = {
  accumulatorCopy: 'accumulatorCopy',
} as const;

const DECLARATION_KINDS = {
  constant: 'const',
} as const;

const enclosingReducer = (node: ESTree.Node) => {
  let parent = node.parent;

  while (parent !== null) {
    if (parent.type === NODE_TYPES.functionDeclaration) return null;

    if (
      parent.type === NODE_TYPES.arrowFunction ||
      parent.type === NODE_TYPES.functionExpression
    ) {
      const callback = parent;
      let owner: ESTree.Node | null = callback.parent;

      while (owner !== null && unwrapArrayExpression(owner) === callback)
        owner = owner.parent;

      if (owner?.type !== NODE_TYPES.callExpression) return null;
      const method = arrayMethodTarget(owner.callee);
      const firstArgument = owner.arguments[0];

      if (
        method === null ||
        !REDUCE_METHODS.has(method.name) ||
        owner.arguments.length > 2 ||
        firstArgument === undefined ||
        unwrapArrayExpression(firstArgument) !== callback
      )
        return null;
      const firstParameter = callback.params[0];

      const accumulator =
        firstParameter?.type === NODE_TYPES.assignmentPattern
          ? firstParameter.left
          : firstParameter;

      if (accumulator?.type !== NODE_TYPES.identifier) return null;

      return { callback, accumulator, initialValue: owner.arguments[1] };
    }

    parent = parent.parent;
  }

  return null;
};

type ReferencesAccumulatorInput = {
  readonly sourceCode: SourceCode;
  readonly node: ESTree.Node;
  readonly accumulator: Variable;
  readonly visited?: Set<Variable>;
};

const referencesAccumulator = ({
  sourceCode,
  node: inputNode,
  accumulator,
  visited = new Set<Variable>(),
}: ReferencesAccumulatorInput): boolean => {
  const variable = resolveArrayBinding({ sourceCode, node: inputNode });

  if (variable === null || visited.has(variable)) return false;

  if (variable === accumulator) return true;
  visited.add(variable);

  if (
    variable.references.some(
      (reference) => reference.isWrite() && !reference.init,
    )
  )
    return false;

  for (const definition of variable.defs) {
    if (
      definition.type === NODE_TYPES.variable &&
      definition.node.type === NODE_TYPES.variableDeclarator &&
      definition.node.id.type === NODE_TYPES.identifier &&
      definition.node.init !== null &&
      definition.node.parent.type === NODE_TYPES.variableDeclaration &&
      definition.node.parent.kind === DECLARATION_KINDS.constant
    ) {
      return referencesAccumulator({
        sourceCode,
        node: definition.node.init,
        accumulator,
        visited,
      });
    }
  }

  return false;
};

type IsGlobalCopyOwnerInput = {
  readonly sourceCode: SourceCode;
  readonly node: ESTree.Node;
  readonly name: string;
};

const isGlobalCopyOwner = ({
  sourceCode,
  node: inputNode,
  name,
}: IsGlobalCopyOwnerInput): boolean => {
  const node = unwrapArrayExpression(inputNode);

  if (node.type !== NODE_TYPES.identifier || node.name !== name) return false;
  const variable = resolveArrayBinding({ sourceCode, node });

  return variable === null || variable.defs.length === 0;
};

type CopiesAccumulatorInput = {
  readonly method: {
    readonly name: string;
    readonly object: ESTree.Node;
  };
  readonly node: ESTree.CallExpression;
  readonly initialValue: ESTree.Node | undefined;
  readonly sourceCode: SourceCode;
  readonly isAccumulator: (expression: ESTree.Node) => boolean;
};

const copiesAccumulator = ({
  method,
  node,
  initialValue,
  sourceCode,
  isAccumulator,
}: CopiesAccumulatorInput): boolean => {
  if (
    method.name === METHOD_NAMES.assign &&
    isGlobalCopyOwner({
      sourceCode,
      node: method.object,
      name: GLOBAL_COPY_OWNERS.object,
    })
  ) {
    const target = node.arguments[0];

    return (
      target !== undefined &&
      unwrapArrayExpression(target).type === NODE_TYPES.objectExpression &&
      node.arguments.slice(1).some(isAccumulator)
    );
  }

  if (
    method.name === METHOD_NAMES.from &&
    isGlobalCopyOwner({
      sourceCode,
      node: method.object,
      name: GLOBAL_COPY_OWNERS.array,
    })
  ) {
    const source = node.arguments[0];

    return source !== undefined && isAccumulator(source);
  }

  if (!ARRAY_COPY_METHODS.has(method.name)) {
    return false;
  }

  const arrayAccumulator =
    initialValue !== undefined &&
    isKnownArrayExpression({ sourceCode, node: initialValue });

  return arrayAccumulator && isAccumulator(method.object);
};

/** Reject non-spread copies of reducer accumulators; pair with oxc/no-accumulating-spread. */
export const noReduceAccumulatorCopyRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow copying growing reducer accumulators with Object.assign, Array.from, or array copy methods.',
    },
    messages: {
      [MESSAGE_IDS.accumulatorCopy]:
        'Do not copy the reducer accumulator on every iteration; growing copies can cause quadratic work. Mutate a fresh, locally owned accumulator and return it, or use an iterator pipeline/flatMap.',
    },
  },
  createOnce: (context) => {
    return {
      CallExpression: (node) => {
        const method = arrayMethodTarget(node.callee);

        if (method === null) return;
        const reducer = enclosingReducer(node);

        if (reducer === null) return;

        const accumulator = context.sourceCode
          .getDeclaredVariables(reducer.callback)
          .find((variable) =>
            variable.identifiers.some(
              (identifier) => identifier.start === reducer.accumulator.start,
            ),
          );

        if (accumulator === undefined) return;

        const isAccumulator = (expression: ESTree.Node) =>
          referencesAccumulator({
            sourceCode: context.sourceCode,
            node: expression,
            accumulator,
          });

        if (
          copiesAccumulator({
            method,
            node,
            initialValue: reducer.initialValue,
            sourceCode: context.sourceCode,
            isAccumulator,
          })
        )
          context.report({ node, messageId: MESSAGE_IDS.accumulatorCopy });
      },
    };
  },
});
