// Objective: Detect optional never members. Used by empty object and interface checks.

import type { ESTree } from '@oxlint/plugins';

import { isNeverType } from '#utils/dictionary-types/is-never-type.js';
import { DICTIONARY_NODE_TYPES } from '#utils/dictionary-types/types.js';

/** Return whether a signature contributes no runtime value to an object type. */
export const isEffectivelyEmptyMember = (
  member: ESTree.TSSignature,
): boolean => {
  return (
    member.type === DICTIONARY_NODE_TYPES.propertySignature &&
    member.optional === true &&
    member.typeAnnotation !== null &&
    member.typeAnnotation !== undefined &&
    isNeverType(member.typeAnnotation.typeAnnotation)
  );
};
