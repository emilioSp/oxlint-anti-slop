// Objective: Reject widening a value before narrowing it with an assertion. Used during TypeScript linting.

import type { ESTree, Variable } from '@oxlint/plugins';
import { defineRule } from '@oxlint/plugins';

import { typeReferenceName } from '#utils/dictionary-types/type-reference-name.js';

const BROAD_TYPE_KINDS = {
  top: 'top',
  object: 'object',
  record: 'record',
} as const;

type BroadTypeKind = (typeof BROAD_TYPE_KINDS)[keyof typeof BROAD_TYPE_KINDS];

type KnownValueEvidence = {
  readonly type: ESTree.TSType | null;
};

const NODE_TYPES = {
  arrowFunction: 'ArrowFunctionExpression',
  functionDeclaration: 'FunctionDeclaration',
  functionExpression: 'FunctionExpression',
  declareFunction: 'TSDeclareFunction',
  emptyBodyFunctionExpression: 'TSEmptyBodyFunctionExpression',
  parenthesizedExpression: 'ParenthesizedExpression',
  parenthesizedType: 'TSParenthesizedType',
  asExpression: 'TSAsExpression',
  typeAssertion: 'TSTypeAssertion',
  unknownKeyword: 'TSUnknownKeyword',
  anyKeyword: 'TSAnyKeyword',
  stringKeyword: 'TSStringKeyword',
  numberKeyword: 'TSNumberKeyword',
  symbolKeyword: 'TSSymbolKeyword',
  unionType: 'TSUnionType',
  typeReference: 'TSTypeReference',
  identifier: 'Identifier',
  readonlyType: 'readonly',
  record: 'Record',
  readonly: 'Readonly',
  propertyKey: 'PropertyKey',
  typeLiteral: 'TSTypeLiteral',
  indexSignature: 'TSIndexSignature',
  objectKeyword: 'TSObjectKeyword',
  arrayType: 'TSArrayType',
  constructorType: 'TSConstructorType',
  functionType: 'TSFunctionType',
  mappedType: 'TSMappedType',
  tupleType: 'TSTupleType',
  intersectionType: 'TSIntersectionType',
  typeOperator: 'TSTypeOperator',
  program: 'Program',
  literal: 'Literal',
  templateLiteral: 'TemplateLiteral',
  arrayExpression: 'ArrayExpression',
  classExpression: 'ClassExpression',
  newExpression: 'NewExpression',
  objectExpression: 'ObjectExpression',
  variable: 'Variable',
  variableDeclarator: 'VariableDeclarator',
  variableDeclaration: 'VariableDeclaration',
} as const;

const MESSAGE_IDS = {
  widenThenAssert: 'widenThenAssert',
} as const;

const DECLARATION_KINDS = {
  constant: 'const',
} as const;

const FUNCTION_BOUNDARY_TYPES: ReadonlySet<string> = new Set([
  NODE_TYPES.arrowFunction,
  NODE_TYPES.functionDeclaration,
  NODE_TYPES.functionExpression,
  NODE_TYPES.declareFunction,
  NODE_TYPES.emptyBodyFunctionExpression,
]);

const unwrapExpressionParentheses = (
  expression: ESTree.Expression,
): ESTree.Expression => {
  let current = expression;

  while (current.type === NODE_TYPES.parenthesizedExpression)
    current = current.expression;

  return current;
};

const unwrapTypeParentheses = (type: ESTree.TSType): ESTree.TSType => {
  let current = type;

  while (current.type === NODE_TYPES.parenthesizedType)
    current = current.typeAnnotation;

  return current;
};

const isUnknownOrAnyType = (type: ESTree.TSType): boolean => {
  const unwrapped = unwrapTypeParentheses(type);

  return (
    unwrapped.type === NODE_TYPES.unknownKeyword ||
    unwrapped.type === NODE_TYPES.anyKeyword
  );
};

const isBroadRecordKeyType = (type: ESTree.TSType): boolean => {
  const unwrapped = unwrapTypeParentheses(type);

  if (
    unwrapped.type === NODE_TYPES.stringKeyword ||
    unwrapped.type === NODE_TYPES.numberKeyword ||
    unwrapped.type === NODE_TYPES.symbolKeyword
  ) {
    return true;
  }

  if (unwrapped.type === NODE_TYPES.unionType)
    return unwrapped.types.every(isBroadRecordKeyType);

  return (
    unwrapped.type === NODE_TYPES.typeReference &&
    typeReferenceName(unwrapped) === NODE_TYPES.propertyKey
  );
};

const isBroadRecordType = (type: ESTree.TSType): boolean => {
  const unwrapped = unwrapTypeParentheses(type);

  if (unwrapped.type === NODE_TYPES.typeReference) {
    if (typeReferenceName(unwrapped) === NODE_TYPES.readonly) {
      const [inner] = unwrapped.typeArguments?.params ?? [];

      return inner !== undefined && isBroadRecordType(inner);
    }

    if (typeReferenceName(unwrapped) !== NODE_TYPES.record) return false;
    const parameters = unwrapped.typeArguments?.params ?? [];

    return (
      parameters.length === 2 &&
      parameters[0] !== undefined &&
      parameters[1] !== undefined &&
      isBroadRecordKeyType(parameters[0]) &&
      isUnknownOrAnyType(parameters[1])
    );
  }

  if (
    unwrapped.type !== NODE_TYPES.typeLiteral ||
    unwrapped.members.length !== 1
  )
    return false;
  const [member] = unwrapped.members;

  const [parameter] =
    member?.type === NODE_TYPES.indexSignature ? member.parameters : [];

  return (
    member?.type === NODE_TYPES.indexSignature &&
    member.parameters.length === 1 &&
    parameter !== undefined &&
    isBroadRecordKeyType(parameter.typeAnnotation.typeAnnotation) &&
    isUnknownOrAnyType(member.typeAnnotation.typeAnnotation)
  );
};

const broadTypeKind = (type: ESTree.TSType): BroadTypeKind | null => {
  const unwrapped = unwrapTypeParentheses(type);

  if (
    unwrapped.type === NODE_TYPES.unknownKeyword ||
    unwrapped.type === NODE_TYPES.anyKeyword
  )
    return BROAD_TYPE_KINDS.top;

  if (unwrapped.type === NODE_TYPES.objectKeyword)
    return BROAD_TYPE_KINDS.object;

  return isBroadRecordType(unwrapped) ? BROAD_TYPE_KINDS.record : null;
};

const assertedExpression = (
  node: ESTree.TSAsExpression | ESTree.TSTypeAssertion,
): ESTree.Expression => {
  return unwrapExpressionParentheses(node.expression);
};

const assertionFromExpression = (
  expression: ESTree.Expression,
): ESTree.TSAsExpression | ESTree.TSTypeAssertion | null => {
  const unwrapped = unwrapExpressionParentheses(expression);

  return unwrapped.type === NODE_TYPES.asExpression ||
    unwrapped.type === NODE_TYPES.typeAssertion
    ? unwrapped
    : null;
};

type NormalizedTypeTextInput = {
  readonly sourceText: string;
  readonly type: ESTree.TSType;
};

const normalizedTypeText = ({
  sourceText,
  type,
}: NormalizedTypeTextInput): string => {
  return sourceText.slice(type.start, type.end).replaceAll(/\s+/gu, '');
};

type TypesHaveSameSyntaxInput = {
  readonly sourceText: string;
  readonly left: ESTree.TSType | null;
  readonly right: ESTree.TSType;
};

const typesHaveSameSyntax = ({
  sourceText,
  left,
  right,
}: TypesHaveSameSyntaxInput): boolean => {
  return (
    left !== null &&
    normalizedTypeText({
      sourceText,
      type: unwrapTypeParentheses(left),
    }) ===
      normalizedTypeText({
        sourceText,
        type: unwrapTypeParentheses(right),
      })
  );
};

const isDefinitelyObjectType = (type: ESTree.TSType): boolean => {
  const unwrapped = unwrapTypeParentheses(type);

  switch (unwrapped.type) {
    case NODE_TYPES.arrayType:
    case NODE_TYPES.constructorType:
    case NODE_TYPES.functionType:
    case NODE_TYPES.mappedType:
    case NODE_TYPES.objectKeyword:
    case NODE_TYPES.tupleType:
      return true;
    case NODE_TYPES.typeLiteral:
      return unwrapped.members.length > 0;
    case NODE_TYPES.intersectionType:
      return unwrapped.types.every(isDefinitelyObjectType);
    case NODE_TYPES.typeOperator:
      return (
        unwrapped.operator === NODE_TYPES.readonlyType &&
        isDefinitelyObjectType(unwrapped.typeAnnotation)
      );
    default:
      return false;
  }
};

const isDefinitelyNarrowerRecordType = (type: ESTree.TSType): boolean => {
  const unwrapped = unwrapTypeParentheses(type);

  if (unwrapped.type === NODE_TYPES.typeLiteral) {
    return unwrapped.members.some(
      (member) => member.type !== NODE_TYPES.indexSignature,
    );
  }

  if (unwrapped.type !== NODE_TYPES.typeReference) return false;

  if (typeReferenceName(unwrapped) === NODE_TYPES.readonly) {
    const [inner] = unwrapped.typeArguments?.params ?? [];

    return inner !== undefined && isDefinitelyNarrowerRecordType(inner);
  }

  if (typeReferenceName(unwrapped) !== NODE_TYPES.record) return false;

  const parameters = unwrapped.typeArguments?.params ?? [];

  return (
    parameters.length === 2 &&
    parameters[1] !== undefined &&
    !isUnknownOrAnyType(parameters[1])
  );
};

const functionBoundary = (node: ESTree.Node): ESTree.Node | null => {
  let current = node.parent;

  while (current !== null && current.type !== NODE_TYPES.program) {
    if (FUNCTION_BOUNDARY_TYPES.has(current.type)) return current;
    current = current.parent;
  }

  return null;
};

type Scope = {
  readonly references: readonly {
    readonly identifier: ESTree.Node;
    readonly resolved: Variable | null;
  }[];
};

type ResolvedVariableForIdentifierInput = {
  readonly scopes: readonly Scope[];
  readonly identifier: ESTree.IdentifierReference;
};

const resolvedVariableForIdentifier = ({
  scopes,
  identifier,
}: ResolvedVariableForIdentifierInput): Variable | null => {
  for (const scope of scopes) {
    const reference = scope.references.find(
      (candidate) =>
        candidate.identifier.start === identifier.start &&
        candidate.identifier.end === identifier.end,
    );

    if (reference !== undefined) return reference.resolved;
  }

  return null;
};

const variableDeclarator = (
  variable: Variable,
): ESTree.VariableDeclarator | null => {
  for (const definition of variable.defs) {
    if (
      definition.type === NODE_TYPES.variable &&
      definition.node.type === NODE_TYPES.variableDeclarator
    ) {
      return definition.node;
    }
  }

  return null;
};

type KnownValueEvidenceInput = {
  readonly expression: ESTree.Expression;
  readonly scopes: readonly Scope[];
  readonly boundary: ESTree.Node | null;
  readonly visitedVariables: ReadonlySet<Variable>;
};

type KnownValueEvidenceForAnnotationInput = {
  readonly variable: Variable;
  readonly boundary: ESTree.Node | null;
};

const knownValueEvidenceForAnnotation = ({
  variable,
  boundary,
}: KnownValueEvidenceForAnnotationInput):
  | KnownValueEvidence
  | null
  | undefined => {
  const annotatedIdentifier = variable.identifiers.find(
    (identifier) =>
      identifier.typeAnnotation !== null &&
      identifier.typeAnnotation !== undefined,
  );

  const annotation = annotatedIdentifier?.typeAnnotation?.typeAnnotation;

  if (annotation === undefined || annotatedIdentifier === undefined)
    return undefined;

  if (
    functionBoundary(annotatedIdentifier) !== boundary ||
    broadTypeKind(annotation) !== null
  )
    return null;

  return { type: annotation };
};

type KnownValueEvidenceForIdentifierInput = {
  readonly expression: ESTree.IdentifierReference;
  readonly scopes: readonly Scope[];
  readonly boundary: ESTree.Node | null;
  readonly visitedVariables: ReadonlySet<Variable>;
};

const knownValueEvidenceForIdentifier = ({
  expression,
  scopes,
  boundary,
  visitedVariables,
}: KnownValueEvidenceForIdentifierInput): KnownValueEvidence | null => {
  const variable = resolvedVariableForIdentifier({
    scopes,
    identifier: expression,
  });

  if (variable === null || visitedVariables.has(variable)) return null;

  const annotationEvidence = knownValueEvidenceForAnnotation({
    variable,
    boundary,
  });

  if (annotationEvidence !== undefined) return annotationEvidence;

  const declarator = variableDeclarator(variable);

  if (
    declarator === null ||
    declarator.parent.type !== NODE_TYPES.variableDeclaration ||
    declarator.parent.kind !== DECLARATION_KINDS.constant ||
    declarator.init === null ||
    variable.references.some(
      (reference) => reference.isWrite() && !reference.init,
    ) ||
    functionBoundary(declarator) !== boundary
  ) {
    return null;
  }

  return knownValueEvidence({
    expression: declarator.init,
    scopes,
    boundary,
    visitedVariables: new Set([...visitedVariables, variable]),
  });
};

const knownValueEvidence = ({
  expression,
  scopes,
  boundary,
  visitedVariables,
}: KnownValueEvidenceInput): KnownValueEvidence | null => {
  const unwrapped = unwrapExpressionParentheses(expression);

  if (
    unwrapped.type === NODE_TYPES.asExpression ||
    unwrapped.type === NODE_TYPES.typeAssertion
  ) {
    if (broadTypeKind(unwrapped.typeAnnotation) !== null) return null;

    return { type: unwrapped.typeAnnotation };
  }

  if (
    unwrapped.type === NODE_TYPES.literal ||
    unwrapped.type === NODE_TYPES.templateLiteral
  ) {
    return { type: null };
  }

  if (
    unwrapped.type === NODE_TYPES.arrayExpression ||
    unwrapped.type === NODE_TYPES.arrowFunction ||
    unwrapped.type === NODE_TYPES.classExpression ||
    unwrapped.type === NODE_TYPES.functionExpression ||
    unwrapped.type === NODE_TYPES.newExpression ||
    unwrapped.type === NODE_TYPES.objectExpression
  ) {
    return { type: null };
  }

  if (unwrapped.type !== NODE_TYPES.identifier) return null;

  return knownValueEvidenceForIdentifier({
    expression: unwrapped,
    scopes,
    boundary,
    visitedVariables,
  });
};

type WidenedBindingInput = {
  readonly variable: Variable;
  readonly scopes: readonly Scope[];
};

type WidenedBinding = {
  readonly broadKind: BroadTypeKind;
  readonly evidence: KnownValueEvidence;
  readonly declaredAt: number;
  readonly boundary: ESTree.Node | null;
};

type StableConstantDeclaratorInput = {
  readonly variable: Variable;
};

const stableConstantDeclarator = ({
  variable,
}: StableConstantDeclaratorInput): ESTree.VariableDeclarator | null => {
  const declarator = variableDeclarator(variable);

  if (
    declarator === null ||
    declarator.parent.type !== NODE_TYPES.variableDeclaration ||
    declarator.parent.kind !== DECLARATION_KINDS.constant ||
    declarator.id.type !== NODE_TYPES.identifier ||
    declarator.init === null ||
    variable.references.some(
      (reference) => reference.isWrite() && !reference.init,
    )
  )
    return null;

  return declarator;
};

const widenedBinding = ({
  variable,
  scopes,
}: WidenedBindingInput): WidenedBinding | null => {
  const declarator = stableConstantDeclarator({ variable });

  if (declarator === null) return null;

  const initializer = declarator.init;

  if (initializer === null) return null;

  const boundary = functionBoundary(declarator);
  const declaredType = declarator.id.typeAnnotation?.typeAnnotation;
  const initializerAssertion = assertionFromExpression(initializer);

  const initializerBroadKind =
    initializerAssertion === null
      ? null
      : broadTypeKind(initializerAssertion.typeAnnotation);

  const declaredBroadKind =
    declaredType === undefined ? null : broadTypeKind(declaredType);

  const broadKind = declaredBroadKind ?? initializerBroadKind;

  if (broadKind === null) return null;

  const originalExpression =
    initializerAssertion !== null && initializerBroadKind !== null
      ? assertedExpression(initializerAssertion)
      : initializer;

  const evidence = knownValueEvidence({
    expression: originalExpression,
    scopes,
    boundary,
    visitedVariables: new Set([variable]),
  });

  return evidence === null
    ? null
    : { broadKind, evidence, declaredAt: declarator.end, boundary };
};

type AssertionIsNarrowerInput = {
  readonly sourceText: string;
  readonly broadKind: BroadTypeKind;
  readonly evidence: KnownValueEvidence;
  readonly assertedType: ESTree.TSType;
};

const assertionIsNarrower = ({
  sourceText,
  broadKind,
  evidence,
  assertedType,
}: AssertionIsNarrowerInput): boolean => {
  if (broadTypeKind(assertedType) !== null) return false;

  if (broadKind === BROAD_TYPE_KINDS.top) return true;

  if (
    typesHaveSameSyntax({
      sourceText,
      left: evidence.type,
      right: assertedType,
    })
  )
    return true;

  if (broadKind === BROAD_TYPE_KINDS.object)
    return isDefinitelyObjectType(assertedType);

  return isDefinitelyNarrowerRecordType(assertedType);
};

/** Detect immutable local bindings that erase a known type and are later asserted back to a narrower type. */
export const noWidenThenAssertRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow local const flows that explicitly widen a known value before asserting the widened binding to a narrower type.',
    },
    messages: {
      [MESSAGE_IDS.widenThenAssert]:
        'Value "{{name}}" is given a broad type and later converted with a type assertion. Keep its original type, or validate external input with a named type guard before using it.',
    },
  },
  createOnce: (context) => {
    let scopes: readonly Scope[] = [];

    const checkAssertion = (
      node: ESTree.TSAsExpression | ESTree.TSTypeAssertion,
    ) => {
      const expression = assertedExpression(node);

      if (expression.type !== NODE_TYPES.identifier) return;

      const variable = resolvedVariableForIdentifier({
        scopes,
        identifier: expression,
      });

      if (variable === null) return;
      const widened = widenedBinding({ variable, scopes });

      if (
        widened === null ||
        node.start <= widened.declaredAt ||
        functionBoundary(node) !== widened.boundary ||
        !assertionIsNarrower({
          sourceText: context.sourceCode.text,
          broadKind: widened.broadKind,
          evidence: widened.evidence,
          assertedType: node.typeAnnotation,
        })
      ) {
        return;
      }

      context.report({
        node,
        messageId: MESSAGE_IDS.widenThenAssert,
        data: { name: expression.name },
      });
    };

    return {
      Program: () => {
        scopes = context.sourceCode.scopeManager.scopes;
      },
      TSAsExpression: checkAssertion,
      TSTypeAssertion: checkAssertion,
    };
  },
});
