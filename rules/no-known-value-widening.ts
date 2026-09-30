// Objective: Reject explicit widening of known values. Used during TypeScript linting.

import type { Context, ESTree, SourceCode, Variable } from '@oxlint/plugins';
import { defineRule } from '@oxlint/plugins';
import { classifyUnsafeDictionaryValue } from '#utils/dictionary-types/classify-unsafe-dictionary-value.js';
import { classifyWideningTarget } from '#utils/dictionary-types/classify-widening-target.js';
import { createTypeEnvironment } from '#utils/dictionary-types/create-type-environment.js';
import { isKnownEvidenceExpression } from '#utils/dictionary-types/is-known-evidence-expression.js';
import {
  type TypeEnvironment,
  WIDENING_TARGET_KINDS,
  type WideningTarget,
} from '#utils/dictionary-types/types.js';
import { containsUnknownType } from '#utils/function-parameters/contains-unknown-type.js';
import { functionParameterBindingName } from '#utils/function-parameters/function-parameter-binding-name.js';
import { functionParameterTypeAnnotation } from '#utils/function-parameters/function-parameter-type-annotation.js';
import type { FunctionParameter } from '#utils/function-parameters/types.js';
import { resolveVariable } from '#utils/scope/resolve-variable.js';

type FunctionExpression = ESTree.ArrowFunctionExpression | ESTree.Function;

const NODE_TYPES = {
  parenthesizedExpression: 'ParenthesizedExpression',
  asExpression: 'TSAsExpression',
  satisfiesExpression: 'TSSatisfiesExpression',
  typeAssertion: 'TSTypeAssertion',
  nonNullExpression: 'TSNonNullExpression',
  identifier: 'Identifier',
  variable: 'Variable',
  variableDeclarator: 'VariableDeclarator',
  variableDeclaration: 'VariableDeclaration',
  arrowFunction: 'ArrowFunctionExpression',
  functionDeclaration: 'FunctionDeclaration',
  functionExpression: 'FunctionExpression',
  declareFunction: 'TSDeclareFunction',
  emptyBodyFunctionExpression: 'TSEmptyBodyFunctionExpression',
  typePredicate: 'TSTypePredicate',
  callExpression: 'CallExpression',
  spreadElement: 'SpreadElement',
  program: 'Program',
  literal: 'Literal',
  privateIdentifier: 'PrivateIdentifier',
  methodDefinition: 'MethodDefinition',
  functionName: 'FunctionName',
  parameter: 'Parameter',
  objectExpression: 'ObjectExpression',
  blockStatement: 'BlockStatement',
} as const;

const MESSAGE_IDS = {
  widening: 'widening',
} as const;

const DECLARATION_KINDS = {
  constant: 'const',
} as const;

const TEXT_VALUES = {
  anonymousFunction: 'anonymous function',
  assignmentOperator: '=',
  assertionSubject: 'assertion',
  unknownTarget: 'unknown',
} as const;

const unwrapExpression = (expression: ESTree.Expression): ESTree.Expression => {
  let current = expression;

  while (
    current.type === NODE_TYPES.parenthesizedExpression ||
    current.type === NODE_TYPES.asExpression ||
    current.type === NODE_TYPES.satisfiesExpression ||
    current.type === NODE_TYPES.typeAssertion ||
    current.type === NODE_TYPES.nonNullExpression
  ) {
    current = current.expression;
  }

  return current;
};

const variableDeclarator = (
  variable: Variable,
): ESTree.VariableDeclarator | null => {
  if (variable.defs.length !== 1) return null;
  const [definition] = variable.defs;

  return definition?.type === NODE_TYPES.variable &&
    definition.node.type === NODE_TYPES.variableDeclarator
    ? definition.node
    : null;
};

type IsStableConstVariableInput = {
  readonly variable: Variable;
  readonly declarator: ESTree.VariableDeclarator;
};

const isStableConstVariable = ({
  variable,
  declarator,
}: IsStableConstVariableInput): boolean => {
  return (
    declarator.parent.type === NODE_TYPES.variableDeclaration &&
    declarator.parent.kind === DECLARATION_KINDS.constant &&
    variable.references.every(
      (reference) => reference.init || !reference.isWrite(),
    )
  );
};

type HasKnownEvidenceInput = {
  readonly sourceCode: SourceCode;
  readonly expression: ESTree.Expression;
  readonly visitedVariables?: Set<Variable>;
};

const hasKnownEvidence = ({
  sourceCode,
  expression,
  visitedVariables = new Set<Variable>(),
}: HasKnownEvidenceInput): boolean => {
  if (isKnownEvidenceExpression(expression)) return true;
  const unwrapped = unwrapExpression(expression);

  if (unwrapped.type !== NODE_TYPES.identifier) return false;
  const variable = resolveVariable({ sourceCode, identifier: unwrapped });

  if (variable === null || visitedVariables.has(variable)) return false;
  const declarator = variableDeclarator(variable);

  if (
    declarator === null ||
    declarator.init === null ||
    !isStableConstVariable({ variable, declarator })
  ) {
    return false;
  }

  visitedVariables.add(variable);

  return hasKnownEvidence({
    sourceCode,
    expression: declarator.init,
    visitedVariables,
  });
};

const isFunctionExpression = (
  node: ESTree.Node,
): node is FunctionExpression => {
  return (
    node.type === NODE_TYPES.arrowFunction ||
    node.type === NODE_TYPES.functionDeclaration ||
    node.type === NODE_TYPES.functionExpression ||
    node.type === NODE_TYPES.declareFunction ||
    node.type === NODE_TYPES.emptyBodyFunctionExpression
  );
};

type LocalFunctionForCallInput = {
  readonly sourceCode: SourceCode;
  readonly callee: ESTree.Expression;
};

const localFunctionForCall = ({
  sourceCode,
  callee,
}: LocalFunctionForCallInput): FunctionExpression | null => {
  const unwrapped = unwrapExpression(callee);

  if (isFunctionExpression(unwrapped)) return unwrapped;

  if (unwrapped.type !== NODE_TYPES.identifier) return null;
  const variable = resolveVariable({ sourceCode, identifier: unwrapped });

  if (variable === null || variable.defs.length !== 1) return null;
  const [definition] = variable.defs;

  if (definition === undefined) return null;

  if (
    definition.type === NODE_TYPES.functionName &&
    isFunctionExpression(definition.node)
  ) {
    return definition.node;
  }

  if (
    definition.type !== NODE_TYPES.variable ||
    definition.node.type !== NODE_TYPES.variableDeclarator
  ) {
    return null;
  }

  const initializer = definition.node.init;

  if (initializer === null) return null;
  const unwrappedInitializer = unwrapExpression(initializer);

  return isFunctionExpression(unwrappedInitializer)
    ? unwrappedInitializer
    : null;
};

type VariableTypeAnnotationInput = {
  readonly sourceCode: SourceCode;
  readonly variable: Variable;
};

const variableTypeAnnotation = ({
  sourceCode,
  variable,
}: VariableTypeAnnotationInput): ESTree.TSTypeAnnotation | null => {
  if (variable.defs.length !== 1) return null;
  const [definition] = variable.defs;

  if (definition === undefined) return null;

  if (
    definition.type === NODE_TYPES.variable &&
    definition.node.type === NODE_TYPES.variableDeclarator &&
    definition.node.id.type === NODE_TYPES.identifier
  ) {
    return definition.node.id.typeAnnotation ?? null;
  }

  if (
    definition.type !== NODE_TYPES.parameter ||
    !isFunctionExpression(definition.node)
  ) {
    return null;
  }

  const parameter = definition.node.params.find(
    (candidate) =>
      functionParameterBindingName({ parameter: candidate, sourceCode }) ===
      variable.name,
  );

  return parameter === undefined
    ? null
    : (functionParameterTypeAnnotation(parameter) ?? null);
};

type HasInformativeTypeInput = {
  readonly type: ESTree.TSType;
  readonly environment: TypeEnvironment;
};

const hasInformativeType = ({
  type,
  environment,
}: HasInformativeTypeInput): boolean => {
  return (
    classifyUnsafeDictionaryValue({
      valueType: type,
      environment,
    }) === null
  );
};

type HasKnownCallArgumentEvidenceInput = {
  readonly sourceCode: SourceCode;
  readonly expression: ESTree.Expression;
  readonly environment: TypeEnvironment;
  readonly visitedVariables?: Set<Variable>;
};

type HasKnownCallArgumentEvidenceForIdentifierInput = {
  readonly sourceCode: SourceCode;
  readonly expression: ESTree.IdentifierReference;
  readonly environment: TypeEnvironment;
  readonly visitedVariables: Set<Variable>;
};

const hasKnownCallArgumentEvidenceForIdentifier = ({
  sourceCode,
  expression,
  environment,
  visitedVariables,
}: HasKnownCallArgumentEvidenceForIdentifierInput): boolean => {
  const variable = resolveVariable({
    sourceCode,
    identifier: expression,
  });

  if (variable === null || visitedVariables.has(variable)) return false;
  const annotation = variableTypeAnnotation({ sourceCode, variable });

  if (annotation !== null) {
    return hasInformativeType({
      type: annotation.typeAnnotation,
      environment,
    });
  }

  const declarator = variableDeclarator(variable);

  if (
    declarator === null ||
    declarator.init === null ||
    !isStableConstVariable({ variable, declarator })
  ) {
    return false;
  }

  visitedVariables.add(variable);

  return hasKnownCallArgumentEvidence({
    sourceCode,
    expression: declarator.init,
    environment,
    visitedVariables,
  });
};

type HasKnownCallExpressionInput = {
  readonly sourceCode: SourceCode;
  readonly callee: ESTree.Expression;
  readonly environment: TypeEnvironment;
};

const hasKnownCallExpression = ({
  sourceCode,
  callee,
  environment,
}: HasKnownCallExpressionInput): boolean => {
  const owner = localFunctionForCall({ sourceCode, callee });
  const returnType = owner?.returnType?.typeAnnotation;

  return (
    returnType !== undefined &&
    hasInformativeType({ type: returnType, environment })
  );
};

const hasKnownCallArgumentEvidence = ({
  sourceCode,
  expression,
  environment,
  visitedVariables = new Set<Variable>(),
}: HasKnownCallArgumentEvidenceInput): boolean => {
  if (
    expression.type === NODE_TYPES.parenthesizedExpression ||
    expression.type === NODE_TYPES.nonNullExpression
  ) {
    return hasKnownCallArgumentEvidence({
      sourceCode,
      expression: expression.expression,
      environment,
      visitedVariables,
    });
  }

  if (
    expression.type === NODE_TYPES.asExpression ||
    expression.type === NODE_TYPES.typeAssertion
  ) {
    return hasInformativeType({
      type: expression.typeAnnotation,
      environment,
    });
  }

  if (expression.type === NODE_TYPES.satisfiesExpression) {
    return hasKnownCallArgumentEvidence({
      sourceCode,
      expression: expression.expression,
      environment,
      visitedVariables,
    });
  }

  if (expression.type === NODE_TYPES.callExpression) {
    return hasKnownCallExpression({
      sourceCode,
      callee: expression.callee,
      environment,
    });
  }

  if (expression.type !== NODE_TYPES.identifier)
    return isKnownEvidenceExpression(expression);

  return hasKnownCallArgumentEvidenceForIdentifier({
    sourceCode,
    expression,
    environment,
    visitedVariables,
  });
};

type TypePredicateSubjectIndexInput = {
  readonly sourceCode: SourceCode;
  readonly owner: FunctionExpression;
};

const typePredicateSubjectIndex = ({
  sourceCode,
  owner,
}: TypePredicateSubjectIndexInput): number | null => {
  const predicate = owner.returnType?.typeAnnotation;

  if (
    predicate?.type !== NODE_TYPES.typePredicate ||
    predicate.parameterName.type !== NODE_TYPES.identifier
  ) {
    return null;
  }

  const predicateParameterName = predicate.parameterName.name;

  const index = owner.params.findIndex(
    (parameter) =>
      functionParameterBindingName({ parameter, sourceCode }) ===
      predicateParameterName,
  );

  return index === -1 ? null : index;
};

type AnnotationTargetInput = {
  readonly annotation: ESTree.TSTypeAnnotation | null | undefined;
  readonly environment: TypeEnvironment;
};

const annotationTarget = ({
  annotation,
  environment,
}: AnnotationTargetInput): WideningTarget | null => {
  return annotation === null || annotation === undefined
    ? null
    : classifyWideningTarget({
        type: annotation.typeAnnotation,
        environment,
      });
};

const enclosingFunction = (node: ESTree.Node): FunctionExpression | null => {
  let current: ESTree.Node | null = node.parent;

  while (current !== null && current.type !== NODE_TYPES.program) {
    if (
      current.type === NODE_TYPES.arrowFunction ||
      current.type === NODE_TYPES.functionDeclaration ||
      current.type === NODE_TYPES.functionExpression
    ) {
      return current;
    }

    current = current.parent;
  }

  return null;
};

type SourceKeyNameInput = {
  readonly sourceCode: SourceCode;
  readonly key: ESTree.PropertyKey;
};

const sourceKeyName = ({ sourceCode, key }: SourceKeyNameInput): string => {
  if (
    key.type === NODE_TYPES.identifier ||
    key.type === NODE_TYPES.privateIdentifier
  )
    return key.name;

  if (key.type === NODE_TYPES.literal) return String(key.value);

  return sourceCode.getText(key);
};

type FunctionNameInput = {
  readonly sourceCode: SourceCode;
  readonly owner: FunctionExpression | null;
};

const functionName = ({ sourceCode, owner }: FunctionNameInput): string => {
  if (owner === null) return TEXT_VALUES.anonymousFunction;

  if (owner.id !== null) return owner.id.name;
  const parent = owner.parent;

  if (
    parent.type === NODE_TYPES.variableDeclarator &&
    parent.id.type === NODE_TYPES.identifier
  )
    return parent.id.name;

  if (parent.type === NODE_TYPES.methodDefinition)
    return sourceKeyName({ sourceCode, key: parent.key });

  return TEXT_VALUES.anonymousFunction;
};

const isEmptyObjectExpression = (expression: ESTree.Expression): boolean => {
  const unwrapped = unwrapExpression(expression);

  return (
    unwrapped.type === NODE_TYPES.objectExpression &&
    unwrapped.properties.length === 0
  );
};

const isDictionaryAccumulatorTarget = (
  destination: WideningTarget,
): boolean => {
  return (
    destination.kind === WIDENING_TARGET_KINDS.openDictionary ||
    destination.kind === WIDENING_TARGET_KINDS.genericContainer
  );
};

const hasParentAssertion = (node: ESTree.Node): boolean => {
  return (
    node.parent?.type === NODE_TYPES.asExpression ||
    node.parent?.type === NODE_TYPES.typeAssertion
  );
};

type ReportFlowInput = {
  readonly expression: ESTree.Expression;
  readonly destination: WideningTarget | null;
  readonly subject: string;
};

type WideningRuleState = {
  environment: TypeEnvironment | null;
};

type WideningRuleServices = {
  readonly context: Context;
  readonly state: WideningRuleState;
  readonly reportFlow: (input: ReportFlowInput) => void;
};

type CreateReportFlowInput = {
  readonly context: Context;
};

const createReportFlow = ({
  context,
}: CreateReportFlowInput): ((input: ReportFlowInput) => void) => {
  return ({ expression, destination, subject }: ReportFlowInput) => {
    if (destination === null) return;

    if (
      isDictionaryAccumulatorTarget(destination) &&
      isEmptyObjectExpression(expression)
    )
      return;

    if (!hasKnownEvidence({ sourceCode: context.sourceCode, expression }))
      return;

    context.report({
      node: expression,
      messageId: MESSAGE_IDS.widening,
      data: { subject, target: destination.kind },
    });
  };
};

type InitializeEnvironmentInput = {
  readonly context: Context;
  readonly state: WideningRuleState;
  readonly node: ESTree.Program;
};

const initializeEnvironment = ({
  context,
  state,
  node,
}: InitializeEnvironmentInput): void => {
  state.environment = createTypeEnvironment({
    program: node,
    visitorKeys: context.sourceCode.visitorKeys,
  });
};

type ReportVariableFlowInput = {
  readonly node: ESTree.VariableDeclarator;
  readonly services: WideningRuleServices;
};

const reportVariableFlow = ({
  node,
  services,
}: ReportVariableFlowInput): void => {
  if (node.init === null || node.id.type !== NODE_TYPES.identifier) return;

  const destination =
    services.state.environment === null || node.id.typeAnnotation === undefined
      ? null
      : annotationTarget({
          annotation: node.id.typeAnnotation,
          environment: services.state.environment,
        });

  services.reportFlow({
    expression: node.init,
    destination,
    subject: `binding \`${node.id.name}\``,
  });
};

type ReportPropertyFlowInput = {
  readonly node: ESTree.PropertyDefinition | ESTree.AccessorProperty;
  readonly services: WideningRuleServices;
};

const reportPropertyFlow = ({
  node,
  services,
}: ReportPropertyFlowInput): void => {
  if (node.value === null) return;

  const destination =
    services.state.environment === null || node.typeAnnotation === undefined
      ? null
      : annotationTarget({
          annotation: node.typeAnnotation,
          environment: services.state.environment,
        });

  services.reportFlow({
    expression: node.value,
    destination,
    subject: `property \`${sourceKeyName({
      sourceCode: services.context.sourceCode,
      key: node.key,
    })}\``,
  });
};

type ReportAssignmentFlowInput = {
  readonly node: ESTree.AssignmentExpression;
  readonly services: WideningRuleServices;
};

const reportAssignmentFlow = ({
  node,
  services,
}: ReportAssignmentFlowInput): void => {
  if (
    node.operator !== TEXT_VALUES.assignmentOperator ||
    node.left.type !== NODE_TYPES.identifier
  )
    return;

  const variable = resolveVariable({
    sourceCode: services.context.sourceCode,
    identifier: node.left,
  });

  if (variable === null) return;
  const declarator = variableDeclarator(variable);

  if (declarator === null || declarator.id.type !== NODE_TYPES.identifier)
    return;

  const destination =
    services.state.environment === null ||
    declarator.id.typeAnnotation === undefined
      ? null
      : annotationTarget({
          annotation: declarator.id.typeAnnotation,
          environment: services.state.environment,
        });

  services.reportFlow({
    expression: node.right,
    destination,
    subject: `binding \`${declarator.id.name}\``,
  });
};

type ReportCallArgumentWideningInput = {
  readonly argument: ESTree.Expression;
  readonly parameter: FunctionParameter;
  readonly owner: FunctionExpression;
  readonly services: WideningRuleServices;
};

const reportCallArgumentWidening = ({
  argument,
  parameter,
  owner,
  services,
}: ReportCallArgumentWideningInput): void => {
  services.context.report({
    node: argument,
    messageId: MESSAGE_IDS.widening,
    data: {
      subject: `argument for parameter \`${functionParameterBindingName({
        parameter,
        sourceCode: services.context.sourceCode,
      })}\` of \`${functionName({
        sourceCode: services.context.sourceCode,
        owner,
      })}\``,
      target: TEXT_VALUES.unknownTarget,
    },
  });
};

type ReportCallArgumentFlowInput = {
  readonly node: ESTree.CallExpression;
  readonly services: WideningRuleServices;
};

const reportCallArgumentFlow = ({
  node,
  services,
}: ReportCallArgumentFlowInput): void => {
  const environment = services.state.environment;

  if (environment === null) return;

  const owner = localFunctionForCall({
    sourceCode: services.context.sourceCode,
    callee: node.callee,
  });

  if (owner === null) return;

  const parameterIndex = typePredicateSubjectIndex({
    sourceCode: services.context.sourceCode,
    owner,
  });

  if (parameterIndex === null) return;
  const parameter = owner.params[parameterIndex];
  const argument = node.arguments[parameterIndex];

  if (
    parameter === undefined ||
    argument === undefined ||
    argument.type === NODE_TYPES.spreadElement
  )
    return;

  const parameterAnnotation = functionParameterTypeAnnotation(parameter);

  if (
    parameterAnnotation === null ||
    parameterAnnotation === undefined ||
    !containsUnknownType(parameterAnnotation.typeAnnotation) ||
    !hasKnownCallArgumentEvidence({
      sourceCode: services.context.sourceCode,
      expression: argument,
      environment,
    })
  )
    return;

  reportCallArgumentWidening({ argument, parameter, owner, services });
};

type ReportReturnFlowInput = {
  readonly node: ESTree.ReturnStatement;
  readonly services: WideningRuleServices;
};

const reportReturnFlow = ({ node, services }: ReportReturnFlowInput): void => {
  if (node.argument === null) return;
  const owner = enclosingFunction(node);

  const destination =
    services.state.environment === null
      ? null
      : annotationTarget({
          annotation: owner?.returnType,
          environment: services.state.environment,
        });

  services.reportFlow({
    expression: node.argument,
    destination,
    subject: `return value of \`${functionName({
      sourceCode: services.context.sourceCode,
      owner,
    })}\``,
  });
};

type ReportArrowReturnFlowInput = {
  readonly node: ESTree.ArrowFunctionExpression;
  readonly services: WideningRuleServices;
};

const reportArrowReturnFlow = ({
  node,
  services,
}: ReportArrowReturnFlowInput): void => {
  if (node.body.type === NODE_TYPES.blockStatement) return;

  const destination =
    services.state.environment === null
      ? null
      : annotationTarget({
          annotation: node.returnType,
          environment: services.state.environment,
        });

  services.reportFlow({
    expression: node.body,
    destination,
    subject: `return value of \`${functionName({
      sourceCode: services.context.sourceCode,
      owner: node,
    })}\``,
  });
};

type ReportAssertionFlowInput = {
  readonly node: ESTree.TSAsExpression | ESTree.TSTypeAssertion;
  readonly services: WideningRuleServices;
};

const reportAssertionFlow = ({
  node,
  services,
}: ReportAssertionFlowInput): void => {
  const environment = services.state.environment;

  if (environment === null || hasParentAssertion(node)) return;

  services.reportFlow({
    expression: node.expression,
    destination: classifyWideningTarget({
      type: node.typeAnnotation,
      environment,
    }),
    subject: TEXT_VALUES.assertionSubject,
  });
};

/** Detect sound syntactic cases where a known value is explicitly widened and loses evidence. */
export const noKnownValueWideningRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow syntactically established values from flowing into explicitly broad or anonymous target types that discard useful evidence.',
    },
    messages: {
      [MESSAGE_IDS.widening]:
        'The explicit `{{target}}` type on {{subject}} hides information already known from the value. Let TypeScript infer the type, use `satisfies` to check a contract, or define a named type.',
    },
  },
  createOnce: (context) => {
    const state: WideningRuleState = { environment: null };
    const reportFlow = createReportFlow({ context });
    const services: WideningRuleServices = { context, state, reportFlow };

    return {
      Program: (node: ESTree.Program) =>
        initializeEnvironment({ context, state, node }),
      VariableDeclarator: (node: ESTree.VariableDeclarator) =>
        reportVariableFlow({ node, services }),
      PropertyDefinition: (node: ESTree.PropertyDefinition) =>
        reportPropertyFlow({ node, services }),
      AccessorProperty: (node: ESTree.AccessorProperty) =>
        reportPropertyFlow({ node, services }),
      AssignmentExpression: (node: ESTree.AssignmentExpression) =>
        reportAssignmentFlow({ node, services }),
      CallExpression: (node: ESTree.CallExpression) =>
        reportCallArgumentFlow({ node, services }),
      ReturnStatement: (node: ESTree.ReturnStatement) =>
        reportReturnFlow({ node, services }),
      ArrowFunctionExpression: (node: ESTree.ArrowFunctionExpression) =>
        reportArrowReturnFlow({ node, services }),
      TSAsExpression: (node: ESTree.TSAsExpression) =>
        reportAssertionFlow({ node, services }),
      TSTypeAssertion: (node: ESTree.TSTypeAssertion) =>
        reportAssertionFlow({ node, services }),
    };
  },
});
