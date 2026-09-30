// Objective: Define shared contracts for dictionary analysis. Used by dictionary classification operations.

import type { ESTree } from '@oxlint/plugins';

import type { TypeAliasEnvironment as LexicalTypeAliasEnvironment } from '#utils/type-alias-resolution/types.js';

export const BUILT_IN_TYPE_NAMES = {
  record: 'Record',
  readonly: 'Readonly',
  partial: 'Partial',
  required: 'Required',
  pick: 'Pick',
  omit: 'Omit',
  propertyKey: 'PropertyKey',
  nonNullable: 'NonNullable',
} as const;

export const BUILT_INS: ReadonlySet<string> = new Set(
  Object.values(BUILT_IN_TYPE_NAMES),
);

export const TRANSPARENT_WRAPPER_NAMES = {
  readonly: BUILT_IN_TYPE_NAMES.readonly,
  partial: BUILT_IN_TYPE_NAMES.partial,
  required: BUILT_IN_TYPE_NAMES.required,
  nonNullable: BUILT_IN_TYPE_NAMES.nonNullable,
} as const;

export const TRANSPARENT_WRAPPERS: ReadonlySet<string> = new Set(
  Object.values(TRANSPARENT_WRAPPER_NAMES),
);

export const DICTIONARY_NODE_TYPES = {
  unknownKeyword: 'TSUnknownKeyword',
  anyKeyword: 'TSAnyKeyword',
  objectKeyword: 'TSObjectKeyword',
  typeLiteral: 'TSTypeLiteral',
  unionType: 'TSUnionType',
  intersectionType: 'TSIntersectionType',
  typeReference: 'TSTypeReference',
  indexSignature: 'TSIndexSignature',
  mappedType: 'TSMappedType',
  propertySignature: 'TSPropertySignature',
  identifier: 'Identifier',
  arrayExpression: 'ArrayExpression',
  callExpression: 'CallExpression',
  variable: 'Variable',
  variableDeclarator: 'VariableDeclarator',
  variableDeclaration: 'VariableDeclaration',
  parenthesizedExpression: 'ParenthesizedExpression',
  chainExpression: 'ChainExpression',
  asExpression: 'TSAsExpression',
  typeAssertion: 'TSTypeAssertion',
  nonNullExpression: 'TSNonNullExpression',
  satisfiesExpression: 'TSSatisfiesExpression',
  arrayType: 'TSArrayType',
  tupleType: 'TSTupleType',
  typeOperator: 'TSTypeOperator',
  literal: 'Literal',
  arrowFunction: 'ArrowFunctionExpression',
  classExpression: 'ClassExpression',
  functionExpression: 'FunctionExpression',
  newExpression: 'NewExpression',
  templateLiteral: 'TemplateLiteral',
  unaryExpression: 'UnaryExpression',
  objectExpression: 'ObjectExpression',
  parenthesizedType: 'TSParenthesizedType',
  stringKeyword: 'TSStringKeyword',
  numberKeyword: 'TSNumberKeyword',
  symbolKeyword: 'TSSymbolKeyword',
  neverKeyword: 'TSNeverKeyword',
  readonlyOperator: 'readonly',
} as const;

export const UNSAFE_DICTIONARY_VALUES = {
  any: 'any',
  emptyObject: 'empty-object',
  object: 'object',
  union: 'union',
  unknown: 'unknown',
} as const;

export const WIDENING_TARGET_KINDS = {
  anonymousObject: 'anonymous object',
  genericContainer: 'generic container',
  object: 'object',
  openDictionary: 'open dictionary',
  unknown: 'unknown',
} as const;

export type DictionaryTypeSubstitutions = ReadonlyMap<string, ESTree.TSType>;

export type DictionaryResolvedType = {
  readonly type: ESTree.TSType;
  readonly substitutions: DictionaryTypeSubstitutions;
};

export type UnsafeDictionaryOptions = {
  readonly allowUnknown: boolean;
};

export const DICTIONARY_KINDS = {
  unsafeDictionary: 'unsafe-dictionary',
} as const;

export type UnsafeDictionary = {
  readonly kind: (typeof DICTIONARY_KINDS)[keyof typeof DICTIONARY_KINDS];
  readonly unsafeValue: (typeof UNSAFE_DICTIONARY_VALUES)[keyof typeof UNSAFE_DICTIONARY_VALUES];
};

export type WideningTargetKind =
  (typeof WIDENING_TARGET_KINDS)[keyof typeof WIDENING_TARGET_KINDS];

export type WideningTarget = {
  readonly kind: WideningTargetKind;
};

export type TypeEnvironment = {
  readonly interfaces: ReadonlyMap<
    string,
    readonly ESTree.TSInterfaceDeclaration[]
  >;
  readonly typeAliases: LexicalTypeAliasEnvironment;
};
