// Objective: Define shared type contracts for type-alias resolution. Used by alias-analysis operations.

import type { ESTree } from '@oxlint/plugins';

export type VisitorKeys = Readonly<Record<string, readonly string[]>>;

export type TypeBinding = {
  readonly alias: ESTree.TSTypeAliasDeclaration | null;
  readonly scope: ESTree.Node;
};

export type TypeAliasEnvironment = {
  readonly bindingsByName: ReadonlyMap<string, readonly TypeBinding[]>;
  readonly visitorKeys: VisitorKeys;
};

export type ResolvedTypeMatcherInput = {
  readonly type: ESTree.TSType;
  readonly matches: (child: ESTree.TSType) => boolean;
};

export type ResolvedTypeMatcher = ({
  type,
  matches,
}: ResolvedTypeMatcherInput) => boolean;
