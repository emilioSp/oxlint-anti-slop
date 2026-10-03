// Objective: Build the dictionary type environment for a program. Used by dictionary rules.

import type { ESTree } from '@oxlint/plugins';
import type { TypeEnvironment } from '#utils/dictionary-types/types.js';
import { createTypeAliasEnvironment } from '#utils/type-alias-resolution/create-type-alias-environment.js';

const NODE_TYPES = {
  exportNamedDeclaration: 'ExportNamedDeclaration',
  exportDefaultDeclaration: 'ExportDefaultDeclaration',
  interfaceDeclaration: 'TSInterfaceDeclaration',
} as const;

const declaredStatement = (statement: ESTree.Statement): ESTree.Node | null => {
  return statement.type === NODE_TYPES.exportNamedDeclaration ||
    statement.type === NODE_TYPES.exportDefaultDeclaration
    ? (statement.declaration ?? null)
    : statement;
};

type CreateTypeEnvironmentInput = {
  readonly program: ESTree.Program;
  readonly visitorKeys: Readonly<Record<string, readonly string[]>>;
};

/** Collect interfaces and aliases needed to classify broad dictionary types. */
export const createTypeEnvironment = ({
  program,
  visitorKeys,
}: CreateTypeEnvironmentInput): TypeEnvironment => {
  const interfaces = new Map<string, ESTree.TSInterfaceDeclaration[]>();

  for (const statement of program.body) {
    const declaration = declaredStatement(statement);

    if (declaration?.type !== NODE_TYPES.interfaceDeclaration) continue;
    const declarations = interfaces.get(declaration.id.name) ?? [];
    declarations.push(declaration);
    interfaces.set(declaration.id.name, declarations);
  }

  return {
    interfaces,
    typeAliases: createTypeAliasEnvironment({ program, visitorKeys }),
  };
};
