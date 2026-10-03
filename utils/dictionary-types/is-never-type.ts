// Objective: Detect the TypeScript never type. Used by empty dictionary checks.

import type { ESTree } from '@oxlint/plugins';

import { DICTIONARY_NODE_TYPES } from '#utils/dictionary-types/types.js';
import { unwrapTransparentType } from '#utils/dictionary-types/unwrap-transparent-type.js';

/** Return whether a type resolves to never after transparent wrappers are removed. */
export const isNeverType = (type: ESTree.TSType): boolean => {
  return (
    unwrapTransparentType(type).type === DICTIONARY_NODE_TYPES.neverKeyword
  );
};
