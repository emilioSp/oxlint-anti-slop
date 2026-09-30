// Objective: Detect empty TypeScript interfaces. Used by unsafe dictionary classification.

import type { ESTree } from '@oxlint/plugins';

import { isEffectivelyEmptyMember } from '#utils/dictionary-types/is-effectively-empty-member.js';

/** Return whether one interface declaration has no effective members or bases. */
export const isEffectivelyEmptyInterface = (
  declarations: readonly ESTree.TSInterfaceDeclaration[],
): boolean => {
  if (declarations.length !== 1) return false;
  const [type] = declarations;

  return (
    type !== undefined &&
    type.extends.length === 0 &&
    (type.body.body.length === 0 ||
      type.body.body.every(isEffectivelyEmptyMember))
  );
};
