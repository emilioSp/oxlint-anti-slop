// Objective: Reject unsafe dictionary value types. Used during TypeScript linting.

import type { ESTree } from '@oxlint/plugins';
import { defineRule } from '@oxlint/plugins';
import { classifyUnsafeDictionary } from '#utils/dictionary-types/classify-unsafe-dictionary.js';
import { classifyUnsafeDictionaryValue } from '#utils/dictionary-types/classify-unsafe-dictionary-value.js';
import { createTypeEnvironment } from '#utils/dictionary-types/create-type-environment.js';
import { typeReferenceName } from '#utils/dictionary-types/type-reference-name.js';
import type { TypeEnvironment } from '#utils/dictionary-types/types.js';
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
  indexSignature: 'TSIndexSignature',
  jsDocNonNullableType: 'JSDocNonNullableType',
  jsDocNullableType: 'JSDocNullableType',
  jsDocUnknownType: 'JSDocUnknownType',
  anyKeyword: 'TSAnyKeyword',
  arrayType: 'TSArrayType',
  bigintKeyword: 'TSBigIntKeyword',
  booleanKeyword: 'TSBooleanKeyword',
  conditionalType: 'TSConditionalType',
  constructorType: 'TSConstructorType',
  functionType: 'TSFunctionType',
  importType: 'TSImportType',
  indexedAccessType: 'TSIndexedAccessType',
  inferType: 'TSInferType',
  intersectionType: 'TSIntersectionType',
  intrinsicKeyword: 'TSIntrinsicKeyword',
  literalType: 'TSLiteralType',
  namedTupleMember: 'TSNamedTupleMember',
  neverKeyword: 'TSNeverKeyword',
  nullKeyword: 'TSNullKeyword',
  numberKeyword: 'TSNumberKeyword',
  objectKeyword: 'TSObjectKeyword',
  parenthesizedType: 'TSParenthesizedType',
  stringKeyword: 'TSStringKeyword',
  symbolKeyword: 'TSSymbolKeyword',
  templateLiteralType: 'TSTemplateLiteralType',
  thisType: 'TSThisType',
  tupleType: 'TSTupleType',
  typeOperator: 'TSTypeOperator',
  typePredicate: 'TSTypePredicate',
  typeQuery: 'TSTypeQuery',
  undefinedKeyword: 'TSUndefinedKeyword',
  unionType: 'TSUnionType',
  unknownKeyword: 'TSUnknownKeyword',
  voidKeyword: 'TSVoidKeyword',
} as const;

const TYPE_NODE_KINDS: ReadonlySet<string> = new Set([
  NODE_TYPES.jsDocNonNullableType,
  NODE_TYPES.jsDocNullableType,
  NODE_TYPES.jsDocUnknownType,
  NODE_TYPES.anyKeyword,
  NODE_TYPES.arrayType,
  NODE_TYPES.bigintKeyword,
  NODE_TYPES.booleanKeyword,
  NODE_TYPES.conditionalType,
  NODE_TYPES.constructorType,
  NODE_TYPES.functionType,
  NODE_TYPES.importType,
  NODE_TYPES.indexedAccessType,
  NODE_TYPES.inferType,
  NODE_TYPES.intersectionType,
  NODE_TYPES.intrinsicKeyword,
  NODE_TYPES.literalType,
  NODE_TYPES.mappedType,
  NODE_TYPES.namedTupleMember,
  NODE_TYPES.neverKeyword,
  NODE_TYPES.nullKeyword,
  NODE_TYPES.numberKeyword,
  NODE_TYPES.objectKeyword,
  NODE_TYPES.parenthesizedType,
  NODE_TYPES.stringKeyword,
  NODE_TYPES.symbolKeyword,
  NODE_TYPES.templateLiteralType,
  NODE_TYPES.thisType,
  NODE_TYPES.tupleType,
  NODE_TYPES.typeLiteral,
  NODE_TYPES.typeOperator,
  NODE_TYPES.typePredicate,
  NODE_TYPES.typeQuery,
  NODE_TYPES.typeReference,
  NODE_TYPES.undefinedKeyword,
  NODE_TYPES.unionType,
  NODE_TYPES.unknownKeyword,
  NODE_TYPES.voidKeyword,
]);

const isTypeNode = (node: ESTree.Node): node is ESTree.TSType => {
  return TYPE_NODE_KINDS.has(node.type);
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

type ShouldReportTypeInput = {
  readonly node: ESTree.TSType;
  readonly environment: TypeEnvironment;
};

const shouldReportType = ({
  node,
  environment,
}: ShouldReportTypeInput): boolean => {
  if (isInsideTypeParameterConstraint(node)) return false;

  if (isPlainAliasConsumerUse({ node, environment })) return false;

  if (
    classifyUnsafeDictionary({
      type: node,
      environment,
      options: DICTIONARY_CLASSIFICATION_OPTIONS,
    }) === null
  )
    return false;
  let current: ESTree.Node | null = node.parent;

  while (current !== null && current.type !== NODE_TYPES.program) {
    if (
      isTypeNode(current) &&
      classifyUnsafeDictionary({
        type: current,
        environment,
        options: DICTIONARY_CLASSIFICATION_OPTIONS,
      }) !== null
    )
      return false;
    current = current.parent;
  }

  return true;
};

/** Disallow object-dictionary contracts whose direct value type is an unsafe escape hatch. */
export const noUnsafeDictionaryTypeRule = defineRule({
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
      if (environment === null || !shouldReportType({ node, environment }))
        return;

      const unsafe = classifyUnsafeDictionary({
        type: node,
        environment,
        options: DICTIONARY_CLASSIFICATION_OPTIONS,
      });

      if (unsafe === null) return;
      report({ node, value: unsafe.unsafeValue });
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

        if (unsafe !== null) report({ node, value: unsafe.unsafeValue });
      },
    };
  },
});
