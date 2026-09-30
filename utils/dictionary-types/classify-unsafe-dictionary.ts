// Objective: Classify dictionary-shaped TypeScript types. Used by the unsafe dictionary rule.

import type { ESTree } from '@oxlint/plugins';

import { classifyUnsafeType } from '#utils/dictionary-types/classify-unsafe-type.js';
import { dictionaryValueTypes } from '#utils/dictionary-types/dictionary-value-types.js';
import {
  DICTIONARY_KINDS,
  type TypeEnvironment,
  UNSAFE_DICTIONARY_VALUES,
  type UnsafeDictionary,
  type UnsafeDictionaryOptions,
} from '#utils/dictionary-types/types.js';

type ClassifyUnsafeDictionaryInput = {
  readonly type: ESTree.TSType;
  readonly environment: TypeEnvironment;
  readonly options?: UnsafeDictionaryOptions;
};

/** Classify every direct value type represented by a dictionary contract. */
export const classifyUnsafeDictionary = ({
  type,
  environment,
  options = { allowUnknown: false },
}: ClassifyUnsafeDictionaryInput): UnsafeDictionary | null => {
  const valueTypes = dictionaryValueTypes({
    type,
    environment,
    substitutions: new Map(),
    resolvingAliases: new Set(),
  });

  for (const valueType of valueTypes) {
    const unsafeValue = classifyUnsafeType({
      type: valueType.type,
      environment,
      substitutions: valueType.substitutions,
      resolvingAliases: new Set(),
      options,
    });

    if (
      unsafeValue === null ||
      (options.allowUnknown && unsafeValue === UNSAFE_DICTIONARY_VALUES.unknown)
    ) {
      continue;
    }

    return { kind: DICTIONARY_KINDS.unsafeDictionary, unsafeValue };
  }

  return null;
};
