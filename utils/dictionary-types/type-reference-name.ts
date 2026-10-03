// Objective: Read a simple TypeScript type-reference name. Used by dictionary classifiers.

import type { ESTree } from '@oxlint/plugins';

import { DICTIONARY_NODE_TYPES } from '#utils/dictionary-types/types.js';

/** Return the identifier name of a simple type reference. */
export const typeReferenceName = (
  type: ESTree.TSTypeReference,
): string | null => {
  return type.typeName.type === DICTIONARY_NODE_TYPES.identifier
    ? type.typeName.name
    : null;
};
