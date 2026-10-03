// Objective: Match types after resolving visible aliases and parameters. Used by type-aware rules.

import type { ESTree } from '@oxlint/plugins';
import { typeReferenceName } from '#utils/dictionary-types/type-reference-name.js';
import type {
  ResolvedTypeMatcher,
  TypeAliasEnvironment,
} from '#utils/type-alias-resolution/types.js';
import { visibleTypeAlias } from '#utils/type-alias-resolution/visible-type-alias.js';

type Substitution = {
  readonly substitutions: Substitutions;
  readonly type: ESTree.TSType;
};

type Substitutions = ReadonlyMap<string, Substitution>;

const NODE_TYPES = {
  typeReference: 'TSTypeReference',
} as const;

type AliasSubstitutionsInput = {
  readonly alias: ESTree.TSTypeAliasDeclaration;
  readonly reference: ESTree.TSTypeReference;
  readonly base: Substitutions;
};

const aliasSubstitutions = ({
  alias,
  reference,
  base,
}: AliasSubstitutionsInput): Substitutions | null => {
  const parameters = alias.typeParameters?.params ?? [];
  const arguments_ = reference.typeArguments?.params ?? [];
  const next = new Map(base);

  for (const [index, parameter] of parameters.entries()) {
    const explicitArgument = arguments_[index];
    const argument = explicitArgument ?? parameter.default;

    if (argument === null || argument === undefined) return null;
    const argumentSubstitutions = explicitArgument === undefined ? next : base;
    next.set(parameter.name.name, {
      type: argument,
      substitutions: new Map(argumentSubstitutions),
    });
  }

  return next;
};

type EvaluateInput = {
  readonly current: ESTree.TSType;
  readonly substitutions: Substitutions;
  readonly resolvingAliases: ReadonlySet<ESTree.TSTypeAliasDeclaration>;
};

type ResolvedTypeMatchesInput = {
  readonly type: ESTree.TSType;
  readonly environment: TypeAliasEnvironment;
  readonly matcher: ResolvedTypeMatcher;
};

/** Match a type after resolving visible aliases and substituting their type parameters. */
export const resolvedTypeMatches = ({
  type,
  environment,
  matcher,
}: ResolvedTypeMatchesInput): boolean => {
  const evaluate = ({
    current,
    substitutions,
    resolvingAliases,
  }: EvaluateInput): boolean => {
    if (current.type === NODE_TYPES.typeReference) {
      const name = typeReferenceName(current);

      if (name !== null) {
        const substitution = substitutions.get(name);

        if (
          substitution !== undefined &&
          !current.typeArguments?.params.length
        ) {
          return evaluate({
            current: substitution.type,
            substitutions: substitution.substitutions,
            resolvingAliases,
          });
        }

        const alias = visibleTypeAlias({
          name,
          use: current,
          environment,
        });

        if (alias !== null && !resolvingAliases.has(alias)) {
          const nextSubstitutions = aliasSubstitutions({
            alias,
            reference: current,
            base: substitutions,
          });

          if (nextSubstitutions !== null) {
            const nextResolving = new Set(resolvingAliases);
            nextResolving.add(alias);

            return evaluate({
              current: alias.typeAnnotation,
              substitutions: nextSubstitutions,
              resolvingAliases: nextResolving,
            });
          }
        }
      }
    }

    return matcher({
      type: current,
      matches: (child) =>
        evaluate({
          current: child,
          substitutions,
          resolvingAliases,
        }),
    });
  };

  return evaluate({
    current: type,
    substitutions: new Map(),
    resolvingAliases: new Set(),
  });
};
