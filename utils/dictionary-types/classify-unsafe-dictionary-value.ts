// Objective: Classify one dictionary value type. Used by widening and dictionary rules.

import type { ESTree } from '@oxlint/plugins';

import { classifyUnsafeType } from '#utils/dictionary-types/classify-unsafe-type.js';
import {
  type TypeEnvironment,
  UNSAFE_DICTIONARY_VALUES,
  type UnsafeDictionaryOptions,
  type UnsafeDictionaryValue,
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
}: ClassifyUnsafeDictionaryValueInput): UnsafeDictionaryValue | null => {
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

  return unsafeValue;
};
