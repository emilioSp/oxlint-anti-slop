// Objective: Classify one dictionary value type. Used by widening and dictionary rules.

import type { ESTree } from '@oxlint/plugins';

import { classifyUnsafeType } from '#utils/dictionary-types/classify-unsafe-type.js';
import {
  DICTIONARY_KINDS,
  type TypeEnvironment,
  UNSAFE_DICTIONARY_VALUES,
  type UnsafeDictionary,
  type UnsafeDictionaryOptions,
} from '#utils/dictionary-types/types.js';

type ClassifyUnsafeDictionaryValueInput = {
  readonly valueType: ESTree.TSType;
  readonly environment: TypeEnvironment;
  readonly options?: UnsafeDictionaryOptions;
};

/** Classify one value type while preserving the configured unknown policy. */
export const classifyUnsafeDictionaryValue = ({
  valueType,
  environment,
  options = { allowUnknown: false },
}: ClassifyUnsafeDictionaryValueInput): UnsafeDictionary | null => {
  const unsafeValue = classifyUnsafeType({
    type: valueType,
    environment,
    substitutions: new Map(),
    resolvingAliases: new Set(),
    options,
  });

  if (
    unsafeValue === null ||
    (options.allowUnknown && unsafeValue === UNSAFE_DICTIONARY_VALUES.unknown)
  ) {
    return null;
  }

  return { kind: DICTIONARY_KINDS.unsafeDictionary, unsafeValue };
};
