// Objective: Extract written test title text. Used by the test title rule.

import type { ESTree } from '@oxlint/plugins';

const isString = (value: unknown): value is string => typeof value === 'string';

export const extractTitle = (
  node: ESTree.CallExpression['arguments'][number] | undefined,
): string | null => {
  if (node?.type === 'Literal') return isString(node.value) ? node.value : null;

  if (node?.type === 'TemplateLiteral') {
    return node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join('${value}');
  }

  return null;
};
