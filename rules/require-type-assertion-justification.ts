// Objective: Require reasons for non-const assertions. Used during TypeScript linting.

import type { ESTree, SourceCode } from '@oxlint/plugins';
import { defineRule } from '@oxlint/plugins';

type TypeAssertion = ESTree.TSAsExpression | ESTree.TSTypeAssertion;

type MarkerOptions = {
  readonly markers?: unknown;
};

const JUSTIFICATION_MARKERS = {
  default: 'JUSTIFICATION',
} as const;

const DEFAULT_JUSTIFICATION_MARKERS = [JUSTIFICATION_MARKERS.default] as const;

const TYPE_NAMES = {
  constAssertion: 'const',
} as const;

const SEPARATORS = {
  markerKey: '\u0000',
} as const;

const MESSAGE_IDS = {
  missingJustificationComment: 'missingJustificationComment',
} as const;

const NODE_TYPES = {
  asExpression: 'TSAsExpression',
  typeAssertion: 'TSTypeAssertion',
  typeReference: 'TSTypeReference',
  identifier: 'Identifier',
  expressionStatement: 'ExpressionStatement',
  propertyDefinition: 'PropertyDefinition',
  returnStatement: 'ReturnStatement',
  throwStatement: 'ThrowStatement',
  variableDeclaration: 'VariableDeclaration',
  exportNamedDeclaration: 'ExportNamedDeclaration',
  program: 'Program',
} as const;

const COMMENT_OWNER_KINDS: ReadonlySet<string> = new Set([
  NODE_TYPES.expressionStatement,
  NODE_TYPES.propertyDefinition,
  NODE_TYPES.returnStatement,
  NODE_TYPES.throwStatement,
  NODE_TYPES.variableDeclaration,
]);

const isMarkerOptions = (value: unknown): value is MarkerOptions => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isNonEmptyMarker = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isConstAssertion = (node: TypeAssertion): boolean => {
  return (
    node.typeAnnotation.type === NODE_TYPES.typeReference &&
    node.typeAnnotation.typeName.type === NODE_TYPES.identifier &&
    node.typeAnnotation.typeName.name === TYPE_NAMES.constAssertion
  );
};

const configuredJustificationMarkers = (option: unknown): readonly string[] => {
  if (!isMarkerOptions(option) || !Array.isArray(option.markers)) {
    return DEFAULT_JUSTIFICATION_MARKERS;
  }

  const markers = option.markers
    .filter(isNonEmptyMarker)
    .map((marker) => marker.trim());

  return markers.length > 0 ? markers : DEFAULT_JUSTIFICATION_MARKERS;
};

const markerPattern = (markers: readonly string[]): RegExp => {
  const alternation = markers
    .map((marker) => marker.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`))
    .join('|');

  return new RegExp(
    String.raw`(?:^|[^\p{L}\p{N}_])(?:${alternation})\s*:\s*\S`,
    'u',
  );
};

type HasJustificationBeforeInput = {
  readonly sourceCode: SourceCode;
  readonly owner: ESTree.Node;
  readonly assertion: TypeAssertion;
  readonly pattern: RegExp;
};

const hasJustificationBefore = ({
  sourceCode,
  owner,
  assertion,
  pattern,
}: HasJustificationBeforeInput): boolean => {
  return sourceCode
    .getCommentsBefore(owner)
    .some(
      (comment) =>
        comment.end <= assertion.start && pattern.test(comment.value),
    );
};

type HasJustificationCommentInput = {
  readonly sourceCode: SourceCode;
  readonly node: TypeAssertion;
  readonly pattern: RegExp;
};

const hasJustificationComment = ({
  sourceCode,
  node,
  pattern,
}: HasJustificationCommentInput): boolean => {
  let current: ESTree.Node = node;

  while (true) {
    if (
      hasJustificationBefore({
        sourceCode,
        owner: current,
        assertion: node,
        pattern,
      })
    )
      return true;

    if (COMMENT_OWNER_KINDS.has(current.type)) {
      const exportDeclaration = current.parent;

      return (
        exportDeclaration.type === NODE_TYPES.exportNamedDeclaration &&
        exportDeclaration.declaration === current &&
        hasJustificationBefore({
          sourceCode,
          owner: exportDeclaration,
          assertion: node,
          pattern,
        })
      );
    }

    if (current.parent.type === NODE_TYPES.program) return false;
    current = current.parent;
  }
};

/** Require every non-const type assertion to state the invariant TypeScript cannot express. */
export const requireTypeAssertionJustificationRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a nearby JUSTIFICATION comment for every TypeScript type assertion except const assertions.',
    },
    messages: {
      [MESSAGE_IDS.missingJustificationComment]:
        'Add a `{{marker}}:` comment before this assertion or its containing statement. Explain why the value can be treated as the asserted type.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          markers: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
            minItems: 1,
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ markers: [JUSTIFICATION_MARKERS.default] }],
  },
  createOnce: (context) => {
    const patterns = new Map<string, RegExp>();

    const checkAssertion = (node: TypeAssertion) => {
      if (isConstAssertion(node)) return;
      const markers = configuredJustificationMarkers(context.options?.[0]);
      const patternKey = markers.join(SEPARATORS.markerKey);
      const pattern = patterns.get(patternKey) ?? markerPattern(markers);
      patterns.set(patternKey, pattern);

      if (
        hasJustificationComment({
          sourceCode: context.sourceCode,
          node,
          pattern,
        })
      )
        return;
      context.report({
        node,
        messageId: MESSAGE_IDS.missingJustificationComment,
        data: { marker: markers[0] ?? DEFAULT_JUSTIFICATION_MARKERS[0] },
      });
    };

    return {
      TSAsExpression: checkAssertion,
      TSTypeAssertion: checkAssertion,
    };
  },
});
