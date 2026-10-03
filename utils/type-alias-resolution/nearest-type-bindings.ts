// Objective: Find the nearest lexical bindings for a type name. Used by alias visibility checks.

import type { ESTree } from '@oxlint/plugins';

import type {
  TypeAliasEnvironment,
  TypeBinding,
} from '#utils/type-alias-resolution/types.js';

type AncestorDistanceInput = {
  readonly ancestor: ESTree.Node;
  readonly node: ESTree.Node;
};

const ancestorDistance = ({
  ancestor,
  node: inputNode,
}: AncestorDistanceInput): number | null => {
  let current: ESTree.Node | null = inputNode;
  let distance = 0;

  while (current !== null) {
    if (current === ancestor) return distance;
    current = current.parent;
    distance += 1;
  }

  return null;
};

type NearestTypeBindingsInput = {
  readonly name: string;
  readonly use: ESTree.Node;
  readonly environment: TypeAliasEnvironment;
};

/** Return the bindings at the nearest visible lexical scope for a type name. */
export const nearestTypeBindings = ({
  name,
  use,
  environment,
}: NearestTypeBindingsInput): readonly TypeBinding[] => {
  const candidates = environment.bindingsByName.get(name) ?? [];
  let nearestDistance = Number.POSITIVE_INFINITY;
  let nearest: TypeBinding[] = [];

  for (const candidate of candidates) {
    const distance = ancestorDistance({ ancestor: candidate.scope, node: use });

    if (distance === null || distance > nearestDistance) continue;

    if (distance === nearestDistance) {
      nearest.push(candidate);
      continue;
    }

    nearestDistance = distance;
    nearest = [candidate];
  }

  return nearest;
};
