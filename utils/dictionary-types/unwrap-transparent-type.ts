// Objective: Remove transparent wrappers from a TypeScript type. Used by dictionary classifiers.

import type { ESTree } from '@oxlint/plugins';

import { DICTIONARY_NODE_TYPES } from '#utils/dictionary-types/types.js';

/** Unwrap parenthesized and readonly type wrappers that do not change dictionary meaning. */
export const unwrapTransparentType = (type: ESTree.TSType): ESTree.TSType => {
  let current = type;

  while (
    current.type === DICTIONARY_NODE_TYPES.parenthesizedType ||
    (current.type === DICTIONARY_NODE_TYPES.typeOperator &&
      current.operator === DICTIONARY_NODE_TYPES.readonlyOperator)
  ) {
    current = current.typeAnnotation;
  }

  return current;
};
