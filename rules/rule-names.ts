// Objective: Define shared Oxlint rule names. Used by plugin registration and rule integration tests.

export const RULE_NAMES = {
  noReduceAccumulatorCopy: 'no-reduce-accumulator-copy',
  noChainedTypeAssertions: 'no-chained-type-assertions',
  noUnnecessaryTypeWidening: 'no-unnecessary-type-widening',
  noObjectParameters: 'no-object-parameters',
  noTypeofOutsideGuards: 'no-typeof-outside-guards',
  noUnsafeDictionaryValues: 'no-unsafe-dictionary-values',
  noMeaninglessUnknownAliases: 'no-meaningless-unknown-aliases',
  noNarrowingAfterWidening: 'no-narrowing-after-widening',
  requireLogicalBlankLines: 'require-logical-blank-lines',
  requireTypeAssertionJustification: 'require-type-assertion-justification',
} as const;
