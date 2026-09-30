// Objective: Build a lexical type-alias environment. Used by rules that resolve TypeScript aliases.

import type { ESTree } from '@oxlint/plugins';

import type {
  TypeAliasEnvironment,
  TypeBinding,
  VisitorKeys,
} from '#utils/type-alias-resolution/types.js';

const environmentsByProgram = new WeakMap<
  ESTree.Program,
  TypeAliasEnvironment
>();

const NODE_TYPES = {
  program: 'Program',
  blockStatement: 'BlockStatement',
  moduleBlock: 'TSModuleBlock',
  staticBlock: 'StaticBlock',
  switchStatement: 'SwitchStatement',
  typeAliasDeclaration: 'TSTypeAliasDeclaration',
  interfaceDeclaration: 'TSInterfaceDeclaration',
  enumDeclaration: 'TSEnumDeclaration',
  classDeclaration: 'ClassDeclaration',
  classExpression: 'ClassExpression',
  importSpecifier: 'ImportSpecifier',
  importDefaultSpecifier: 'ImportDefaultSpecifier',
  importNamespaceSpecifier: 'ImportNamespaceSpecifier',
} as const;

const isNode = (value: unknown): value is ESTree.Node => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string'
  );
};

const enclosingTypeScope = (node: ESTree.Node): ESTree.Node => {
  let current: ESTree.Node | null = node.parent;

  while (current !== null) {
    if (
      current.type === NODE_TYPES.program ||
      current.type === NODE_TYPES.blockStatement ||
      current.type === NODE_TYPES.moduleBlock ||
      current.type === NODE_TYPES.staticBlock ||
      current.type === NODE_TYPES.switchStatement
    ) {
      return current;
    }

    current = current.parent;
  }

  return node;
};

const declaredTypeBinding = (
  node: ESTree.Node,
): {
  readonly alias: ESTree.TSTypeAliasDeclaration | null;
  readonly name: string;
} | null => {
  if (node.type === NODE_TYPES.typeAliasDeclaration) {
    return { alias: node, name: node.id.name };
  }

  if (
    node.type === NODE_TYPES.interfaceDeclaration ||
    node.type === NODE_TYPES.enumDeclaration ||
    node.type === NODE_TYPES.classDeclaration ||
    node.type === NODE_TYPES.classExpression
  ) {
    return node.id === null ? null : { alias: null, name: node.id.name };
  }

  if (
    node.type === NODE_TYPES.importSpecifier ||
    node.type === NODE_TYPES.importDefaultSpecifier ||
    node.type === NODE_TYPES.importNamespaceSpecifier
  ) {
    return { alias: null, name: node.local.name };
  }

  return null;
};

type CollectTypeBindingsInput = {
  readonly node: ESTree.Node;
  readonly visitorKeys: VisitorKeys;
  readonly bindingsByName: Map<string, TypeBinding[]>;
  readonly aliases: ESTree.TSTypeAliasDeclaration[];
};

const collectTypeBindings = ({
  node,
  visitorKeys,
  bindingsByName,
  aliases,
}: CollectTypeBindingsInput): void => {
  const declared = declaredTypeBinding(node);

  if (declared !== null) {
    const bindings = bindingsByName.get(declared.name) ?? [];
    bindings.push({ ...declared, scope: enclosingTypeScope(node) });
    bindingsByName.set(declared.name, bindings);

    if (declared.alias !== null) aliases.push(declared.alias);
  }

  const unknownNode: unknown = node;

  // JUSTIFICATION: Oxlint's visitor keys identify only ESTree child-node properties.
  const fields = unknownNode as Readonly<Record<string, unknown>>;

  for (const key of visitorKeys[node.type] ?? []) {
    const value = fields[key];

    if (isNode(value)) {
      collectTypeBindings({
        node: value,
        visitorKeys,
        bindingsByName,
        aliases,
      });
      continue;
    }

    if (!Array.isArray(value)) continue;

    for (const child of value) {
      if (isNode(child))
        collectTypeBindings({
          node: child,
          visitorKeys,
          bindingsByName,
          aliases,
        });
    }
  }
};

type CreateTypeAliasEnvironmentInput = {
  readonly program: ESTree.Program;
  readonly visitorKeys: VisitorKeys;
};

/** Collect every lexical type alias and competing type binding in a program. */
export const createTypeAliasEnvironment = ({
  program,
  visitorKeys,
}: CreateTypeAliasEnvironmentInput): TypeAliasEnvironment => {
  const cached = environmentsByProgram.get(program);

  if (cached !== undefined) return cached;
  const bindingsByName = new Map<string, TypeBinding[]>();
  const aliases: ESTree.TSTypeAliasDeclaration[] = [];
  collectTypeBindings({ node: program, visitorKeys, bindingsByName, aliases });
  const environment = { aliases, bindingsByName, visitorKeys };
  environmentsByProgram.set(program, environment);

  return environment;
};
