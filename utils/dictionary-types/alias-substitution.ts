// Objective: Build type-parameter substitutions for an alias reference. Used by dictionary classifiers.

import type { ESTree } from '@oxlint/plugins';

import { resolvedSubstitutionArgument } from '#utils/dictionary-types/resolved-substitution-argument.js';
import type { DictionaryTypeSubstitutions } from '#utils/dictionary-types/types.js';

type AliasSubstitutionInput = {
  readonly alias: ESTree.TSTypeAliasDeclaration;
  readonly type: ESTree.TSTypeReference;
  readonly base: DictionaryTypeSubstitutions;
};

/** Return substitutions for the type parameters used by an alias reference. */
export const aliasSubstitution = ({
  alias,
  type,
  base,
}: AliasSubstitutionInput): DictionaryTypeSubstitutions | null => {
  const parameters = alias.typeParameters?.params ?? [];
  const arguments_ = type.typeArguments?.params ?? [];
  const next = new Map(base);

  for (const [index, parameter] of parameters.entries()) {
    const argument = arguments_[index] ?? parameter.default;

    if (argument === null || argument === undefined) return null;
    next.set(
      parameter.name.name,
      resolvedSubstitutionArgument({ type: argument, base: next }),
    );
  }

  return next;
};
