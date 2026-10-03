// Objective: Resolve the visible type alias at a node. Used by type-aware lint rules.

import type { ESTree } from '@oxlint/plugins';

import { lexicalTypeParameterNames } from '#utils/lexical-type-parameters/lexical-type-parameter-names.js';
import { nearestTypeBindings } from '#utils/type-alias-resolution/nearest-type-bindings.js';
import type { TypeAliasEnvironment } from '#utils/type-alias-resolution/types.js';

type VisibleTypeAliasInput = {
  readonly name: string;
  readonly use: ESTree.Node;
  readonly environment: TypeAliasEnvironment;
};

/** Resolve the nearest visible alias with this name, respecting lexical shadowing. */
export const visibleTypeAlias = ({
  name,
  use,
  environment,
}: VisibleTypeAliasInput): ESTree.TSTypeAliasDeclaration | null => {
  if (
    lexicalTypeParameterNames({
      node: use,
      visitorKeys: environment.visitorKeys,
    }).has(name)
  )
    return null;
  const bindings = nearestTypeBindings({ name, use, environment });

  return bindings.length === 1 ? (bindings[0]?.alias ?? null) : null;
};
