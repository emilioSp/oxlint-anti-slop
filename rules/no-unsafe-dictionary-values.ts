// Objective: Reject unsafe dictionary value types. Used during TypeScript linting.

import type { ESTree } from '@oxlint/plugins';
import { defineRule } from '@oxlint/plugins';
import { classifyUnsafeDictionary } from '#utils/dictionary-types/classify-unsafe-dictionary.js';
import { classifyUnsafeDictionaryValue } from '#utils/dictionary-types/classify-unsafe-dictionary-value.js';
import { createTypeEnvironment } from '#utils/dictionary-types/create-type-environment.js';
import { typeReferenceName } from '#utils/dictionary-types/type-reference-name.js';
import type {
  TypeEnvironment,
  UnsafeDictionaryValue,
} from '#utils/dictionary-types/types.js';
import { visibleTypeAlias } from '#utils/type-alias-resolution/visible-type-alias.js';

const MESSAGE_IDS = {
  unsafeDictionary: 'unsafeDictionary',
} as const;

const NODE_TYPES = {
  program: 'Program',
  typeAliasDeclaration: 'TSTypeAliasDeclaration',
  typeParameter: 'TSTypeParameter',
  typeLiteral: 'TSTypeLiteral',
  typeReference: 'TSTypeReference',
  mappedType: 'TSMappedType',
  parenthesizedType: 'TSParenthesizedType',
  typeOperator: 'TSTypeOperator',
} as const;

// Only dictionary shapes and their transparent wrappers can classify as dictionaries.
const isDictionaryTypeNode = (node: ESTree.Node): node is ESTree.TSType => {
  return (
    node.type === NODE_TYPES.typeReference ||
    node.type === NODE_TYPES.typeLiteral ||
    node.type === NODE_TYPES.mappedType ||
    node.type === NODE_TYPES.parenthesizedType ||
    node.type === NODE_TYPES.typeOperator
  );
};

const isInsideTypeAliasDeclaration = (node: ESTree.Node): boolean => {
  let current: ESTree.Node | null = node.parent;

  while (current !== null && current.type !== NODE_TYPES.program) {
    if (current.type === NODE_TYPES.typeAliasDeclaration) return true;
    current = current.parent;
  }

  return false;
};

type IsPlainAliasConsumerUseInput = {
  readonly node: ESTree.TSType;
  readonly environment: TypeEnvironment;
};

const isPlainAliasConsumerUse = ({
  node,
  environment,
}: IsPlainAliasConsumerUseInput): boolean => {
  if (
    node.type !== NODE_TYPES.typeReference ||
    node.typeArguments?.params.length
  )
    return false;
  const name = typeReferenceName(node);

  return (
    name !== null &&
    visibleTypeAlias({
      name,
      use: node,
      environment: environment.typeAliases,
    }) !== null &&
    !isInsideTypeAliasDeclaration(node)
  );
};

const DICTIONARY_CLASSIFICATION_OPTIONS = { allowUnknown: true } as const;

const isInsideTypeParameterConstraint = (node: ESTree.TSType): boolean => {
  let child: ESTree.Node = node;
  let parent: ESTree.Node | null = child.parent;

  while (parent !== null && parent.type !== NODE_TYPES.program) {
    if (parent.type === NODE_TYPES.typeParameter && parent.constraint === child)
      return true;
    child = parent;
    parent = child.parent;
  }

  return false;
};

type ReportableDictionaryInput = {
  readonly node: ESTree.TSType;
  readonly environment: TypeEnvironment;
};

const reportableDictionary = ({
  node,
  environment,
}: ReportableDictionaryInput): UnsafeDictionaryValue | null => {
  if (isInsideTypeParameterConstraint(node)) return null;

  if (isPlainAliasConsumerUse({ node, environment })) return null;

  const unsafe = classifyUnsafeDictionary({
    type: node,
    environment,
    options: DICTIONARY_CLASSIFICATION_OPTIONS,
  });

  if (unsafe === null) return null;
  let current: ESTree.Node | null = node.parent;

  while (current !== null && current.type !== NODE_TYPES.program) {
    if (
      isDictionaryTypeNode(current) &&
      classifyUnsafeDictionary({
        type: current,
        environment,
        options: DICTIONARY_CLASSIFICATION_OPTIONS,
      }) !== null
    )
      return null;
    current = current.parent;
  }

  return unsafe;
};

/** Disallow object-dictionary contracts whose direct value type is an unsafe escape hatch. */
export const noUnsafeDictionaryValuesRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow object-dictionary contracts whose direct value type is any, object, {}, or a union/alias containing one of those escape hatches.',
    },
    messages: {
      [MESSAGE_IDS.unsafeDictionary]:
        'This dictionary uses the broad `{{value}}` value type. Replace it with a concrete value type, and validate external data before storing it.',
    },
  },
  createOnce: (context) => {
    let environment: TypeEnvironment | null = null;

    type ReportInput = {
      readonly node: ESTree.Node;
      readonly value: string;
    };

    const report = ({ node, value }: ReportInput) => {
      context.report({
        node,
        messageId: MESSAGE_IDS.unsafeDictionary,
        data: { value },
      });
    };

    const reportIfUnsafe = (node: ESTree.TSType) => {
      if (environment === null) return;
      const unsafe = reportableDictionary({ node, environment });

      if (unsafe === null) return;
      report({ node, value: unsafe });
    };

    return {
      Program: (node) => {
        environment = createTypeEnvironment({
          program: node,
          visitorKeys: context.sourceCode.visitorKeys,
        });
      },
      TSTypeReference: reportIfUnsafe,
      TSTypeLiteral: reportIfUnsafe,
      TSMappedType: reportIfUnsafe,
      TSIndexSignature: (node) => {
        if (
          environment === null ||
          node.typeAnnotation === null ||
          node.parent.type === NODE_TYPES.typeLiteral
        )
          return;

        const unsafe = classifyUnsafeDictionaryValue({
          valueType: node.typeAnnotation.typeAnnotation,
          environment,
          options: DICTIONARY_CLASSIFICATION_OPTIONS,
        });

        if (unsafe !== null) report({ node, value: unsafe });
      },
    };
  },
});
