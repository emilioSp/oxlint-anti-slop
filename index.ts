// Objective: Register the anti-slop Oxlint plugin. Used when Oxlint loads this package.

import { eslintCompatPlugin } from '@oxlint/plugins';
import { noChainedTypeAssertionsRule } from '#rules/no-chained-type-assertions.js';
import { noMeaninglessUnknownAliasesRule } from '#rules/no-meaningless-unknown-aliases.js';
import { noNarrowingAfterWideningRule } from '#rules/no-narrowing-after-widening.js';
import { noObjectParametersRule } from '#rules/no-object-parameters.js';
import { noReduceAccumulatorCopyRule } from '#rules/no-reduce-accumulator-copy.js';
import { noTypeofOutsideGuardsRule } from '#rules/no-typeof-outside-guards.js';
import { noUnnecessaryTypeWideningRule } from '#rules/no-unnecessary-type-widening.js';
import { noUnsafeDictionaryValuesRule } from '#rules/no-unsafe-dictionary-values.js';
import { requireLogicalBlankLinesRule } from '#rules/require-logical-blank-lines.js';
import { requireTypeAssertionJustificationRule } from '#rules/require-type-assertion-justification.js';
import { RULE_NAMES } from '#rules/rule-names.js';

/** Generic Oxlint rules that reject low-evidence and low-signal implementation patterns. */
const antiSlopPlugin = eslintCompatPlugin({
  meta: { name: 'anti-slop' },
  rules: {
    [RULE_NAMES.noReduceAccumulatorCopy]: noReduceAccumulatorCopyRule,
    [RULE_NAMES.noChainedTypeAssertions]: noChainedTypeAssertionsRule,
    [RULE_NAMES.noUnnecessaryTypeWidening]: noUnnecessaryTypeWideningRule,
    [RULE_NAMES.noObjectParameters]: noObjectParametersRule,
    [RULE_NAMES.noTypeofOutsideGuards]: noTypeofOutsideGuardsRule,
    [RULE_NAMES.noUnsafeDictionaryValues]: noUnsafeDictionaryValuesRule,
    [RULE_NAMES.noMeaninglessUnknownAliases]: noMeaninglessUnknownAliasesRule,
    [RULE_NAMES.noNarrowingAfterWidening]: noNarrowingAfterWideningRule,
    [RULE_NAMES.requireLogicalBlankLines]: requireLogicalBlankLinesRule,
    [RULE_NAMES.requireTypeAssertionJustification]:
      requireTypeAssertionJustificationRule,
  },
});

export default antiSlopPlugin;
