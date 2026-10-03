// Objective: Classify broad TypeScript target types. Used by the known-value widening rule.

import type { ESTree } from '@oxlint/plugins';

import { aliasSubstitution } from '#utils/dictionary-types/alias-substitution.js';
import { isBuiltIn } from '#utils/dictionary-types/is-built-in.js';
import { isUnappliedReferenceTo } from '#utils/dictionary-types/is-unapplied-reference-to.js';
import { typeReferenceName } from '#utils/dictionary-types/type-reference-name.js';
import {
  BUILT_IN_TYPE_NAMES,
  DICTIONARY_NODE_TYPES,
  type DictionaryTypeSubstitutions,
  TRANSPARENT_WRAPPERS,
  type TypeEnvironment,
  WIDENING_TARGET_KINDS,
  type WideningTarget,
} from '#utils/dictionary-types/types.js';
import { unwrapTransparentType } from '#utils/dictionary-types/unwrap-transparent-type.js';
import { visibleTypeAlias } from '#utils/type-alias-resolution/visible-type-alias.js';

type ClassifyWideningTargetInput = {
  readonly type: ESTree.TSType;
  readonly environment: TypeEnvironment;
};

/** Classify a target type that can hide information already known from a value. */
export const classifyWideningTarget = ({
  type,
  environment,
}: ClassifyWideningTargetInput): WideningTarget | null => {
  const unwrapped = unwrapTransparentType(type);

  if (unwrapped.type === DICTIONARY_NODE_TYPES.unknownKeyword) {
    return { kind: WIDENING_TARGET_KINDS.unknown };
  }

  if (unwrapped.type === DICTIONARY_NODE_TYPES.objectKeyword) {
    return { kind: WIDENING_TARGET_KINDS.object };
  }

  if (unwrapped.type === DICTIONARY_NODE_TYPES.typeLiteral) {
    return unwrapped.members.some(
      (member) => member.type === DICTIONARY_NODE_TYPES.indexSignature,
    )
      ? { kind: WIDENING_TARGET_KINDS.openDictionary }
      : unwrapped.members.length > 0
        ? { kind: WIDENING_TARGET_KINDS.anonymousObject }
        : null;
  }

  if (unwrapped.type === DICTIONARY_NODE_TYPES.mappedType) {
    return { kind: WIDENING_TARGET_KINDS.openDictionary };
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
      : classifyWideningTarget({ type: wrapped, environment });
  }

  if (
    name === BUILT_IN_TYPE_NAMES.record &&
    isBuiltIn({ name, use: unwrapped, environment })
  ) {
    return hasBroadRecordKey({
      type: unwrapped,
      environment,
      substitutions: new Map(),
    })
      ? { kind: WIDENING_TARGET_KINDS.openDictionary }
      : null;
  }

  const alias = visibleTypeAlias({
    name,
    use: unwrapped,
    environment: environment.typeAliases,
  });

  if (alias === null) return null;

  if ((alias.typeParameters?.params.length ?? 0) > 0) {
    const substitutions = aliasSubstitution({
      alias,
      type: unwrapped,
      base: new Map(),
    });

    const resolved =
      substitutions === null
        ? null
        : classifyAliasBroadTarget({
            type: alias.typeAnnotation,
            environment,
            substitutions,
            resolvingAliases: new Set([name]),
          });

    return resolved?.kind === WIDENING_TARGET_KINDS.openDictionary
      ? { kind: WIDENING_TARGET_KINDS.genericContainer }
      : null;
  }

  const substitutions = aliasSubstitution({
    alias,
    type: unwrapped,
    base: new Map(),
  });

  if (substitutions === null) return null;

  return classifyAliasBroadTarget({
    type: alias.typeAnnotation,
    environment,
    substitutions,
    resolvingAliases: new Set([name]),
  });
};

type HasBroadRecordKeyInput = {
  readonly type: ESTree.TSTypeReference;
  readonly environment: TypeEnvironment;
  readonly substitutions: DictionaryTypeSubstitutions;
};

const hasBroadRecordKey = ({
  type,
  environment,
  substitutions,
}: HasBroadRecordKeyInput): boolean => {
  const key = type.typeArguments?.params[0];

  return (
    key === undefined ||
    isBroadMappedKey({ type: key, environment, substitutions })
  );
};

type IsBroadMappedKeyInput = {
  readonly type: ESTree.TSType;
  readonly environment: TypeEnvironment;
  readonly substitutions: DictionaryTypeSubstitutions;
  readonly visitedAliases?: ReadonlySet<string>;
};

const isBroadMappedKey = ({
  type,
  environment,
  substitutions,
  visitedAliases = new Set(),
}: IsBroadMappedKeyInput): boolean => {
  const unwrapped = unwrapTransparentType(type);

  if (
    unwrapped.type === DICTIONARY_NODE_TYPES.stringKeyword ||
    unwrapped.type === DICTIONARY_NODE_TYPES.numberKeyword ||
    unwrapped.type === DICTIONARY_NODE_TYPES.symbolKeyword
  ) {
    return true;
  }

  if (unwrapped.type === DICTIONARY_NODE_TYPES.unionType) {
    return unwrapped.types.some((member) =>
      isBroadMappedKey({
        type: member,
        environment,
        substitutions,
        visitedAliases,
      }),
    );
  }

  if (unwrapped.type !== DICTIONARY_NODE_TYPES.typeReference) return false;
  const name = typeReferenceName(unwrapped);

  if (name === null) return false;
  const substitution = substitutions.get(name);

  if (
    substitution !== undefined &&
    !isUnappliedReferenceTo({ type: substitution, name })
  ) {
    return isBroadMappedKey({
      type: substitution,
      environment,
      substitutions,
      visitedAliases,
    });
  }

  if (
    name === BUILT_IN_TYPE_NAMES.propertyKey &&
    isBuiltIn({ name, use: unwrapped, environment })
  )
    return true;

  const alias = visibleTypeAlias({
    name,
    use: unwrapped,
    environment: environment.typeAliases,
  });

  if (
    alias === null ||
    (alias.typeParameters?.params.length ?? 0) > 0 ||
    visitedAliases.has(name)
  ) {
    return false;
  }

  const nextVisited = new Set(visitedAliases);
  nextVisited.add(name);

  return isBroadMappedKey({
    type: alias.typeAnnotation,
    environment,
    substitutions,
    visitedAliases: nextVisited,
  });
};

type ClassifyAliasBroadTargetInput = {
  readonly type: ESTree.TSType;
  readonly environment: TypeEnvironment;
  readonly substitutions: DictionaryTypeSubstitutions;
  readonly resolvingAliases: ReadonlySet<string>;
};

const classifyAliasBroadTarget = ({
  type,
  environment,
  substitutions,
  resolvingAliases,
}: ClassifyAliasBroadTargetInput): WideningTarget | null => {
  const unwrapped = unwrapTransparentType(type);

  if (unwrapped.type === DICTIONARY_NODE_TYPES.unknownKeyword) {
    return { kind: WIDENING_TARGET_KINDS.unknown };
  }

  if (unwrapped.type === DICTIONARY_NODE_TYPES.objectKeyword) {
    return { kind: WIDENING_TARGET_KINDS.object };
  }

  if (unwrapped.type === DICTIONARY_NODE_TYPES.typeLiteral) {
    return unwrapped.members.some(
      (member) => member.type === DICTIONARY_NODE_TYPES.indexSignature,
    )
      ? { kind: WIDENING_TARGET_KINDS.openDictionary }
      : null;
  }

  if (unwrapped.type === DICTIONARY_NODE_TYPES.mappedType) {
    return isBroadMappedKey({
      type: unwrapped.constraint,
      environment,
      substitutions,
    })
      ? { kind: WIDENING_TARGET_KINDS.openDictionary }
      : null;
  }

  if (unwrapped.type !== DICTIONARY_NODE_TYPES.typeReference) return null;
  const name = typeReferenceName(unwrapped);

  if (name === null) return null;
  const substitution = substitutions.get(name);

  if (substitution !== undefined) {
    return isUnappliedReferenceTo({ type: substitution, name })
      ? null
      : classifyAliasBroadTarget({
          type: substitution,
          environment,
          substitutions,
          resolvingAliases,
        });
  }

  if (
    TRANSPARENT_WRAPPERS.has(name) &&
    isBuiltIn({ name, use: unwrapped, environment })
  ) {
    const wrapped = unwrapped.typeArguments?.params[0];

    return wrapped === undefined
      ? null
      : classifyAliasBroadTarget({
          type: wrapped,
          environment,
          substitutions,
          resolvingAliases,
        });
  }

  if (
    name === BUILT_IN_TYPE_NAMES.record &&
    isBuiltIn({ name, use: unwrapped, environment })
  ) {
    return hasBroadRecordKey({ type: unwrapped, environment, substitutions })
      ? { kind: WIDENING_TARGET_KINDS.openDictionary }
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

  return classifyAliasBroadTarget({
    type: alias.typeAnnotation,
    environment,
    substitutions: nextSubstitutions,
    resolvingAliases: nextResolving,
  });
};
