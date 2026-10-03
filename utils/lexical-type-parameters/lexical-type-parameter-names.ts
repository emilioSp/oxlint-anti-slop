// Objective: Collect lexical TypeScript type binders. Used by type-alias resolution.

import type { ESTree } from '@oxlint/plugins';

type VisitorKeys = Readonly<Record<string, readonly string[]>>;

const NODE_TYPES = {
  inferType: 'TSInferType',
  program: 'Program',
  mappedType: 'TSMappedType',
  conditionalType: 'TSConditionalType',
} as const;

const isNode = (value: unknown): value is ESTree.Node => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string'
  );
};

type CollectInferTypeParameterNamesInput = {
  readonly node: ESTree.Node;
  readonly visitorKeys: VisitorKeys;
  readonly names: Set<string>;
};

const collectInferTypeParameterNames = ({
  node,
  visitorKeys,
  names,
}: CollectInferTypeParameterNamesInput): void => {
  if (node.type === NODE_TYPES.inferType)
    names.add(node.typeParameter.name.name);
  const unknownNode: unknown = node;

  // JUSTIFICATION: Oxlint's visitor keys identify only ESTree child-node properties.
  const record = unknownNode as Readonly<Record<string, unknown>>;

  for (const key of visitorKeys[node.type] ?? []) {
    const value = record[key];

    if (isNode(value)) {
      collectInferTypeParameterNames({ node: value, visitorKeys, names });
      continue;
    }

    if (!Array.isArray(value)) continue;

    for (const child of value) {
      if (isNode(child))
        collectInferTypeParameterNames({ node: child, visitorKeys, names });
    }
  }
};

type LexicalTypeParameterNamesInput = {
  readonly node: ESTree.Node;
  readonly visitorKeys: VisitorKeys;
};

/** Collect type binders that are in scope at a node and can shadow module aliases. */
export const lexicalTypeParameterNames = ({
  node,
  visitorKeys,
}: LexicalTypeParameterNamesInput): ReadonlySet<string> => {
  const names = new Set<string>();
  let descendant: ESTree.Node = node;
  let current: ESTree.Node | null = node;

  while (current !== null && current.type !== NODE_TYPES.program) {
    if ('typeParameters' in current) {
      for (const parameter of current.typeParameters?.params ?? []) {
        names.add(parameter.name.name);
      }
    }

    if (
      current.type === NODE_TYPES.mappedType &&
      (descendant === current.nameType || descendant === current.typeAnnotation)
    ) {
      names.add(current.key.name);
    }

    if (
      current.type === NODE_TYPES.conditionalType &&
      descendant === current.trueType
    ) {
      collectInferTypeParameterNames({
        node: current.extendsType,
        visitorKeys,
        names,
      });
    }

    descendant = current;
    current = current.parent;
  }

  return names;
};
