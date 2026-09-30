// Objective: Detect unshadowed built-in TypeScript utility names. Used by dictionary classifiers.

import type { ESTree } from '@oxlint/plugins';

import {
  BUILT_INS,
  type TypeEnvironment,
} from '#utils/dictionary-types/types.js';
import { hasVisibleTypeBinding } from '#utils/type-alias-resolution/has-visible-type-binding.js';

type IsBuiltInInput = {
  readonly name: string;
  readonly use: ESTree.Node;
  readonly environment: TypeEnvironment;
};

/** Return whether a name is a built-in utility type at a use site. */
export const isBuiltIn = ({
  name,
  use,
  environment,
}: IsBuiltInInput): boolean => {
  return (
    BUILT_INS.has(name) &&
    !hasVisibleTypeBinding({
      name,
      use,
      environment: environment.typeAliases,
    })
  );
};
