// Objective: Detect type-name shadowing at a node. Used when built-in type names are analyzed.

import type { ESTree } from '@oxlint/plugins';

import { lexicalTypeParameterNames } from '#utils/lexical-type-parameters/lexical-type-parameter-names.js';
import { nearestTypeBindings } from '#utils/type-alias-resolution/nearest-type-bindings.js';
import type { TypeAliasEnvironment } from '#utils/type-alias-resolution/types.js';

type HasVisibleTypeBindingInput = {
  readonly name: string;
  readonly use: ESTree.Node;
  readonly environment: TypeAliasEnvironment;
};

/** Return whether a local declaration shadows a built-in type at this use. */
export const hasVisibleTypeBinding = ({
  name,
  use,
  environment,
}: HasVisibleTypeBindingInput): boolean => {
  return (
    lexicalTypeParameterNames({
      node: use,
      visitorKeys: environment.visitorKeys,
    }).has(name) || nearestTypeBindings({ name, use, environment }).length > 0
  );
};
