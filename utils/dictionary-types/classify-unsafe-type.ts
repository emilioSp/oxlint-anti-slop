// Objective: Classify one TypeScript type for unsafe dictionary values. Used by dictionary rules.

import type { ESTree } from '@oxlint/plugins';

import { aliasSubstitution } from '#utils/dictionary-types/alias-substitution.js';
import { isBuiltIn } from '#utils/dictionary-types/is-built-in.js';
import { isEffectivelyEmptyInterface } from '#utils/dictionary-types/is-effectively-empty-interface.js';
import { isEffectivelyEmptyTypeLiteral } from '#utils/dictionary-types/is-effectively-empty-type-literal.js';
import { isUnappliedReferenceTo } from '#utils/dictionary-types/is-unapplied-reference-to.js';
import { typeReferenceName } from '#utils/dictionary-types/type-reference-name.js';
import {
  DICTIONARY_NODE_TYPES,
  type DictionaryTypeSubstitutions,
  TRANSPARENT_WRAPPERS,
  type TypeEnvironment,
  UNSAFE_DICTIONARY_VALUES,
  type UnsafeDictionaryOptions,
  type UnsafeDictionaryValue,
} from '#utils/dictionary-types/types.js';
import { unwrapTransparentType } from '#utils/dictionary-types/unwrap-transparent-type.js';
import { visibleTypeAlias } from '#utils/type-alias-resolution/visible-type-alias.js';

type ClassifyUnsafeTypeInput = {
  readonly type: ESTree.TSType;
  readonly environment: TypeEnvironment;
  readonly substitutions: DictionaryTypeSubstitutions;
  readonly resolvingAliases: ReadonlySet<string>;
  readonly options: UnsafeDictionaryOptions;
};

/** Classify one type after resolving transparent wrappers and visible aliases. */
export const classifyUnsafeType = ({
  type,
  environment,
  substitutions,
  resolvingAliases,
  options,
}: ClassifyUnsafeTypeInput): UnsafeDictionaryValue | null => {
  const unwrapped = unwrapTransparentType(type);

  if (unwrapped.type === DICTIONARY_NODE_TYPES.unknownKeyword)
    return UNSAFE_DICTIONARY_VALUES.unknown;

  if (unwrapped.type === DICTIONARY_NODE_TYPES.anyKeyword)
    return UNSAFE_DICTIONARY_VALUES.any;

  if (unwrapped.type === DICTIONARY_NODE_TYPES.objectKeyword)
    return UNSAFE_DICTIONARY_VALUES.object;

  if (
    unwrapped.type === DICTIONARY_NODE_TYPES.typeLiteral &&
    isEffectivelyEmptyTypeLiteral(unwrapped)
  ) {
    return UNSAFE_DICTIONARY_VALUES.emptyObject;
  }

  if (unwrapped.type === DICTIONARY_NODE_TYPES.unionType) {
    const unsafeMembers = unwrapped.types.map((member) =>
      classifyUnsafeType({
        type: member,
        environment,
        substitutions,
        resolvingAliases,
        options,
      }),
    );

    if (unsafeMembers.includes(UNSAFE_DICTIONARY_VALUES.any))
      return UNSAFE_DICTIONARY_VALUES.union;

    if (
      options.allowUnknown &&
      unsafeMembers.includes(UNSAFE_DICTIONARY_VALUES.unknown)
    )
      return UNSAFE_DICTIONARY_VALUES.unknown;

    return unsafeMembers.some((member) => member !== null)
      ? UNSAFE_DICTIONARY_VALUES.union
      : null;
  }

  if (unwrapped.type === DICTIONARY_NODE_TYPES.intersectionType) {
    const unsafeMembers = unwrapped.types.map((member) =>
      classifyUnsafeType({
        type: member,
        environment,
        substitutions,
        resolvingAliases,
        options,
      }),
    );

    if (unsafeMembers.includes(UNSAFE_DICTIONARY_VALUES.any))
      return UNSAFE_DICTIONARY_VALUES.any;

    if (
      options.allowUnknown &&
      unsafeMembers.includes(UNSAFE_DICTIONARY_VALUES.unknown) &&
      unsafeMembers.every((member) => member !== null)
    ) {
      return (
        unsafeMembers.find(
          (member) => member !== UNSAFE_DICTIONARY_VALUES.unknown,
        ) ?? UNSAFE_DICTIONARY_VALUES.unknown
      );
    }

    return unsafeMembers.length > 0 &&
      unsafeMembers.every((member) => member !== null)
      ? unsafeMembers[0]
      : null;
  }

  if (unwrapped.type !== DICTIONARY_NODE_TYPES.typeReference) return null;
  const name = typeReferenceName(unwrapped);

  if (name === null) return null;

  if (
    TRANSPARENT_WRAPPERS.has(name) &&
    isBuiltIn({ name, use: unwrapped, environment })
  ) {
    const wrapped = unwrapped.typeArguments?.params[0];

    return wrapped === undefined
      ? null
      : classifyUnsafeType({
          type: wrapped,
          environment,
          substitutions,
          resolvingAliases,
          options,
        });
  }

  const substitution = substitutions.get(name);

  if (substitution !== undefined) {
    return isUnappliedReferenceTo({ type: substitution, name })
      ? null
      : classifyUnsafeType({
          type: substitution,
          environment,
          substitutions,
          resolvingAliases,
          options,
        });
  }

  const interfaceDeclarations = environment.interfaces.get(name);

  if (interfaceDeclarations !== undefined) {
    return isEffectivelyEmptyInterface(interfaceDeclarations)
      ? UNSAFE_DICTIONARY_VALUES.emptyObject
      : null;
  }

  const alias = visibleTypeAlias({
    name,
    use: unwrapped,
    environment: environment.typeAliases,
  });

  if (alias === null || resolvingAliases.has(name)) return null;

  const nextSubstitutions = aliasSubstitution({
    alias,
    type: unwrapped,
    base: substitutions,
  });

  if (nextSubstitutions === null) return null;
  const nextResolving = new Set(resolvingAliases);
  nextResolving.add(name);

  return classifyUnsafeType({
    type: alias.typeAnnotation,
    environment,
    substitutions: nextSubstitutions,
    resolvingAliases: nextResolving,
    options,
  });
};
