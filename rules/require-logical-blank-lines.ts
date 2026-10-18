// Objective: Require readable blank-line spacing. Used during TypeScript linting.

import type { CreateRule } from '@oxlint/plugins';

import createPaddingLineRule from '#eslint-stylistic/padding-line-between-statements.js';
import type { StatementOption } from '#eslint-stylistic/padding-line-options.js';

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

const DECLARATION_KINDS = [
  PADDING_VALUES.function,
  PADDING_VALUES.class,
  PADDING_VALUES.interface,
  PADDING_VALUES.type,
] satisfies StatementOption;

const MULTILINE_DECLARATIONS = [
  PADDING_VALUES.multilineConst,
  PADDING_VALUES.multilineLet,
  PADDING_VALUES.multilineVar,
  PADDING_VALUES.multilineUsing,
] satisfies StatementOption;

const CONTROL_STATEMENTS = [
  PADDING_VALUES.return,
  PADDING_VALUES.if,
  PADDING_VALUES.switch,
  PADDING_VALUES.try,
  PADDING_VALUES.for,
  PADDING_VALUES.while,
  PADDING_VALUES.do,
] satisfies StatementOption;

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
export const requireLogicalBlankLinesRule: CreateRule = {
  ...paddingRule,
  meta: {
    ...paddingRule.meta,
    docs: {
      description: 'Require readable spacing between declarations and logical statement groups.',
    },
    schema: [],
  },
};
