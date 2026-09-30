// Objective: Detect type references without type arguments. Used by alias substitution logic.

import type { ESTree } from '@oxlint/plugins';

import { typeReferenceName } from '#utils/dictionary-types/type-reference-name.js';
import { DICTIONARY_NODE_TYPES } from '#utils/dictionary-types/types.js';
import { unwrapTransparentType } from '#utils/dictionary-types/unwrap-transparent-type.js';

type IsUnappliedReferenceToInput = {
  readonly type: ESTree.TSType;
  readonly name: string;
};

/** Return whether a type is an unapplied reference to the given name. */
export const isUnappliedReferenceTo = ({
  type,
  name,
}: IsUnappliedReferenceToInput): boolean => {
  const unwrapped = unwrapTransparentType(type);

  return (
    unwrapped.type === DICTIONARY_NODE_TYPES.typeReference &&
    typeReferenceName(unwrapped) === name &&
    (unwrapped.typeArguments === null ||
      unwrapped.typeArguments === undefined ||
      unwrapped.typeArguments.params.length === 0)
  );
};
