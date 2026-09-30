// Objective: Register the anti-slop Oxlint plugin. Used when Oxlint loads this package.

import { eslintCompatPlugin } from '@oxlint/plugins';
import { noChainedTypeAssertionsRule } from '#rules/no-chained-type-assertions.js';
import { noKnownValueWideningRule } from '#rules/no-known-value-widening.js';
import { noObjectParametersRule } from '#rules/no-object-parameters.js';
import { noReduceAccumulatorCopyRule } from '#rules/no-reduce-accumulator-copy.js';
import { noRuntimeTypeofRule } from '#rules/no-runtime-typeof.js';
import { noUnknownTypeAliasesRule } from '#rules/no-unknown-type-aliases.js';
import { noUnsafeDictionaryTypeRule } from '#rules/no-unsafe-dictionary-type.js';
import { noWidenThenAssertRule } from '#rules/no-widen-then-assert.js';
import { requireJustificationCommentForTypeAssertionRule } from '#rules/require-justification-comment-for-type-assertion.js';
import { requireReadableSpacingRule } from '#rules/require-readable-spacing.js';

const RULE_NAMES = {
  noReduceAccumulatorCopy: 'no-reduce-accumulator-copy',
  noChainedTypeAssertions: 'no-chained-type-assertions',
  noKnownValueWidening: 'no-known-value-widening',
  noObjectParameters: 'no-object-parameters',
  noRuntimeTypeof: 'no-runtime-typeof',
  noUnsafeDictionaryType: 'no-unsafe-dictionary-type',
  noUnknownTypeAliases: 'no-unknown-type-aliases',
  noWidenThenAssert: 'no-widen-then-assert',
  requireReadableSpacing: 'require-readable-spacing',
  requireJustificationCommentForTypeAssertion:
    'require-justification-comment-for-type-assertion',
} as const;

/** Generic Oxlint rules that reject low-evidence and low-signal implementation patterns. */
const antiSlopPlugin = eslintCompatPlugin({
  meta: { name: 'anti-slop' },
  rules: {
    [RULE_NAMES.noReduceAccumulatorCopy]: noReduceAccumulatorCopyRule,
    [RULE_NAMES.noChainedTypeAssertions]: noChainedTypeAssertionsRule,
    [RULE_NAMES.noKnownValueWidening]: noKnownValueWideningRule,
    [RULE_NAMES.noObjectParameters]: noObjectParametersRule,
    [RULE_NAMES.noRuntimeTypeof]: noRuntimeTypeofRule,
    [RULE_NAMES.noUnsafeDictionaryType]: noUnsafeDictionaryTypeRule,
    [RULE_NAMES.noUnknownTypeAliases]: noUnknownTypeAliasesRule,
    [RULE_NAMES.noWidenThenAssert]: noWidenThenAssertRule,
    [RULE_NAMES.requireReadableSpacing]: requireReadableSpacingRule,
    [RULE_NAMES.requireJustificationCommentForTypeAssertion]:
      requireJustificationCommentForTypeAssertionRule,
  },
});

export default antiSlopPlugin;
