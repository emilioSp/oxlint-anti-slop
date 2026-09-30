// Objective: Require readable blank-line spacing. Used during TypeScript linting.

import type { CreateRule } from '@oxlint/plugins';

import createPaddingLineRule from '#eslint-stylistic/padding-line-between-statements.js';

const PADDING_VALUES = {
  always: 'always',
  any: 'any',
  wildcard: '*',
  import: 'import',
  function: 'function',
  class: 'class',
  interface: 'interface',
  type: 'type',
  multilineConst: 'multiline-const',
  multilineLet: 'multiline-let',
  multilineVar: 'multiline-var',
  multilineUsing: 'multiline-using',
  return: 'return',
  if: 'if',
  switch: 'switch',
  try: 'try',
  for: 'for',
  while: 'while',
  do: 'do',
  blockLike: 'block-like',
} as const;

const DECLARATION_KINDS: [
  typeof PADDING_VALUES.function,
  typeof PADDING_VALUES.class,
  typeof PADDING_VALUES.interface,
  typeof PADDING_VALUES.type,
] = [
  PADDING_VALUES.function,
  PADDING_VALUES.class,
  PADDING_VALUES.interface,
  PADDING_VALUES.type,
];

const MULTILINE_DECLARATIONS: [
  typeof PADDING_VALUES.multilineConst,
  typeof PADDING_VALUES.multilineLet,
  typeof PADDING_VALUES.multilineVar,
  typeof PADDING_VALUES.multilineUsing,
] = [
  PADDING_VALUES.multilineConst,
  PADDING_VALUES.multilineLet,
  PADDING_VALUES.multilineVar,
  PADDING_VALUES.multilineUsing,
];

const CONTROL_STATEMENTS: [
  typeof PADDING_VALUES.return,
  typeof PADDING_VALUES.if,
  typeof PADDING_VALUES.switch,
  typeof PADDING_VALUES.try,
  typeof PADDING_VALUES.for,
  typeof PADDING_VALUES.while,
  typeof PADDING_VALUES.do,
] = [
  PADDING_VALUES.return,
  PADDING_VALUES.if,
  PADDING_VALUES.switch,
  PADDING_VALUES.try,
  PADDING_VALUES.for,
  PADDING_VALUES.while,
  PADDING_VALUES.do,
];

const paddingRule = createPaddingLineRule([
  {
    blankLine: PADDING_VALUES.always,
    prev: PADDING_VALUES.import,
    next: PADDING_VALUES.wildcard,
  },
  {
    blankLine: PADDING_VALUES.always,
    prev: PADDING_VALUES.wildcard,
    next: { selector: 'Program > :not(ImportDeclaration)' },
  },
  {
    blankLine: PADDING_VALUES.always,
    prev: { selector: 'Program > :not(ImportDeclaration)' },
    next: PADDING_VALUES.wildcard,
  },
  {
    blankLine: PADDING_VALUES.always,
    prev: PADDING_VALUES.wildcard,
    next: DECLARATION_KINDS,
  },
  {
    blankLine: PADDING_VALUES.always,
    prev: DECLARATION_KINDS,
    next: PADDING_VALUES.wildcard,
  },
  {
    blankLine: PADDING_VALUES.always,
    prev: PADDING_VALUES.wildcard,
    next: MULTILINE_DECLARATIONS,
  },
  {
    blankLine: PADDING_VALUES.always,
    prev: MULTILINE_DECLARATIONS,
    next: PADDING_VALUES.wildcard,
  },
  {
    blankLine: PADDING_VALUES.always,
    prev: PADDING_VALUES.wildcard,
    next: CONTROL_STATEMENTS,
  },
  {
    blankLine: PADDING_VALUES.always,
    prev: PADDING_VALUES.blockLike,
    next: PADDING_VALUES.wildcard,
  },
  {
    blankLine: PADDING_VALUES.any,
    prev: PADDING_VALUES.import,
    next: PADDING_VALUES.import,
  },
  {
    blankLine: PADDING_VALUES.any,
    prev: {
      selector:
        ':matches(TSDeclareFunction, ExportNamedDeclaration[declaration.type="TSDeclareFunction"])',
    },
    next: {
      selector:
        ':matches(TSDeclareFunction, FunctionDeclaration, ExportNamedDeclaration[declaration.type="TSDeclareFunction"], ExportNamedDeclaration[declaration.type="FunctionDeclaration"])',
    },
  },
]);

/** Restore structural blank lines with whitespace-only fixes; keep local short bindings and overloads grouped. */
export const requireReadableSpacingRule: CreateRule = {
  ...paddingRule,
  meta: {
    ...paddingRule.meta,
    docs: {
      description:
        'Require readable spacing between declarations and logical statement groups.',
    },
    schema: [],
  },
};
