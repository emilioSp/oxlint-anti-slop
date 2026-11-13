// Objective: Enforce structured test case titles. Used when linting test declarations.

import type { ESTree } from '@oxlint/plugins';
import { defineRule } from '@oxlint/plugins';

import { extractTitle } from '#utils/test-titles/extract-title.js';

const modifiers = new Set([
  'only',
  'skip',
  'todo',
  'fail',
  'fails',
  'failing',
  'fixme',
  'concurrent',
  'sequential',
]);

const builders = new Set(['each', 'for', 'skipIf', 'runIf']);

const titlePattern = /^GIVEN .+ WHEN .+ THEN .+$/;

// Recognize `test`, `it`, or modifier chains such as `test.concurrent.only`.
const isTestFunctionOrModifier = (node: ESTree.Node): boolean => {
  if (node.type === 'Identifier') return node.name === 'test' || node.name === 'it';

  if (node.type !== 'MemberExpression' || node.computed || node.property.type !== 'Identifier')
    return false;

  return modifiers.has(node.property.name) && isTestFunctionOrModifier(node.object);
};

// Recognize the builder member, e.g. `test.each` in `test.each(data)('title', body)`.
const isTestBuilder = (node: ESTree.Node, tagged: boolean): boolean => {
  if (node.type !== 'MemberExpression' || node.computed || node.property.type !== 'Identifier')
    return false;

  return (
    (tagged ? node.property.name === 'each' : builders.has(node.property.name)) &&
    isTestFunctionOrModifier(node.object)
  );
};

// Recognize calls that declare tests, e.g. `test('title', body)` or `test.each(data)('title', body)`.
const isTestDeclaration = (callee: ESTree.Node): boolean => {
  if (isTestFunctionOrModifier(callee)) return true;

  if (callee.type === 'CallExpression') return isTestBuilder(callee.callee, false);

  if (callee.type === 'TaggedTemplateExpression') return isTestBuilder(callee.tag, true);

  return false;
};

export const testsRequireGivenWhenThenRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Require uppercase GIVEN, WHEN, THEN test case titles.' },
    messages: {
      title:
        'Use a test title matching "GIVEN ... WHEN ... THEN ...". If this format is not possible, explicitly disable this rule inline with `// oxlint-disable-next-line anti-slop/tests-require-given-when-then`.',
    },
  },
  createOnce: (context) => ({
    CallExpression: (node) => {
      if (!isTestDeclaration(node.callee)) return;
      const title = extractTitle(node.arguments[0]);

      if (title === null || !titlePattern.test(title)) context.report({ node, messageId: 'title' });
    },
  }),
});
