// Objective: Detect empty TypeScript object literals. Used by unsafe dictionary classification.

import type { ESTree } from '@oxlint/plugins';

import { isEffectivelyEmptyMember } from '#utils/dictionary-types/is-effectively-empty-member.js';

/** Return whether a type literal has no effective members. */
export const isEffectivelyEmptyTypeLiteral = (
  type: ESTree.TSTypeLiteral,
): boolean => {
  return type.members.every(isEffectivelyEmptyMember);
};
