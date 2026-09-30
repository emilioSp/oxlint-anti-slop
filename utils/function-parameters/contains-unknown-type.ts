// Objective: Detect TypeScript unknown in parameter-related types. Used by widening rules.

import type { ESTree } from '@oxlint/plugins';

const TYPE_KINDS = {
  unknownKeyword: 'TSUnknownKeyword',
  parenthesizedType: 'TSParenthesizedType',
  unionType: 'TSUnionType',
} as const;

/** Return whether a type is or contains TypeScript's absorbing unknown top type. */
export const containsUnknownType = (type: ESTree.TSType): boolean => {
  if (type.type === TYPE_KINDS.unknownKeyword) return true;

  if (type.type === TYPE_KINDS.parenthesizedType)
    return containsUnknownType(type.typeAnnotation);

  return (
    type.type === TYPE_KINDS.unionType && type.types.some(containsUnknownType)
  );
};
