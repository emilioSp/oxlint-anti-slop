// Objective: Resolve a type substitution argument through aliases. Used by dictionary classifiers.

import type { ESTree } from '@oxlint/plugins';

import { typeReferenceName } from '#utils/dictionary-types/type-reference-name.js';
import { DICTIONARY_NODE_TYPES } from '#utils/dictionary-types/types.js';
import { unwrapTransparentType } from '#utils/dictionary-types/unwrap-transparent-type.js';

type ResolvedSubstitutionArgumentInput = {
  readonly type: ESTree.TSType;
  readonly base: ReadonlyMap<string, ESTree.TSType>;
  readonly resolving?: ReadonlySet<string>;
};

/** Resolve a substituted type while preventing recursive aliases from looping. */
export const resolvedSubstitutionArgument = ({
  type,
  base,
  resolving = new Set(),
}: ResolvedSubstitutionArgumentInput): ESTree.TSType => {
  const unwrapped = unwrapTransparentType(type);

  if (unwrapped.type !== DICTIONARY_NODE_TYPES.typeReference) return type;
  const name = typeReferenceName(unwrapped);

  if (name === null || resolving.has(name)) return type;
  const substitution = base.get(name);

  if (substitution === undefined) return type;
  const nextResolving = new Set(resolving);
  nextResolving.add(name);

  return resolvedSubstitutionArgument({
    type: substitution,
    base,
    resolving: nextResolving,
  });
};
