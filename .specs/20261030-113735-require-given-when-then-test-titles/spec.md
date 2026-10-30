# R-07: Require given/when/then test titles

See [proposal.md](proposal.md) for scope and [design.md](design.md) for approved technical decisions. Probes use the built plugin with only
`anti-slop/tests-require-given-when-then` enabled as an error in a test configuration; repository configuration changes are deferred.

## Requirements

### REQ1: Recognize tests by function name

Delta: added

Recognize direct calls named `test` and `it` regardless of import source or local binding. Only these root identifiers qualify. Do not follow import or local aliases or
recognize namespace/object calls such as `framework.test(...)`.

Verified by: [AC1](#ac1-import-source-does-not-limit-enforcement), [AC2](#ac2-local-test-functions-are-checked), [AC3](#ac3-aliases-and-object-methods-are-excluded).

#### AC1: Import source does not limit enforcement

1. Probe: Lint an invalid title in a direct `test` call, separately imported from `@playwright/test`, `vitest`, `@jest/globals`, and an arbitrary module such as
   `custom-test-library`.
2. Expected result: Exactly one title-format diagnostic per declaration.
3. Example: Lint `import { test } from '@playwright/test'; test('loads the page', async () => {});` and receive exactly one title-format diagnostic.

#### AC2: Local test functions are checked

1. Probe: Lint invalid titles through locally declared functions named `test` and `it`.
2. Expected result: Exactly one title-format diagnostic per declaration despite the local binding.
3. Example: Lint `function it(title, body) {} it('loads the page', () => {});` and receive exactly one title-format diagnostic.

#### AC3: Aliases and object methods are excluded

1. Probe: Lint invalid titles through import aliases, local aliases, and object methods rather than root `test` or `it` identifiers.
2. Expected result: No diagnostics from this rule.
3. Example: Lint
   `import { test as check } from '@playwright/test'; const another = check; check('loads the page', () => {}); another('loads the page', () => {}); framework.test('loads the page', () => {});`
   and receive no diagnostics from this rule.

### REQ2: Check test declaration variants, not suites or helpers

Delta: added

Check declarations rooted at `test` or `it` with the modifiers `only`, `skip`, `todo`, `fail`, `fails`, `failing`, `fixme`, `concurrent`, and `sequential`, including
chains. Recognize the curried builders `each`, `for`, `skipIf`, and `runIf`, and tagged-template `each`; check the final declaration's first argument as its title, not
builder arguments or table data. Exclude suites, helpers, and unknown methods. Report calls whose first argument is absent or a non-string literal, including runtime
overloads such as `test.skip(true, 'not supported')`. Document inline rule suppression as the escape hatch when such calls are needed. Handling of other unavailable title
expressions is described in REQ3.

Verified by: [AC4](#ac4-supported-modifiers-and-chains-are-checked), [AC5](#ac5-supported-builders-are-checked), [AC6](#ac6-tagged-each-titles-are-checked),
[AC7](#ac7-non-test-case-methods-are-excluded), [AC8](#ac8-non-title-overloads-are-reported), [AC18](#ac18-inline-suppression-allows-an-intentional-overload).

#### AC4: Supported modifiers and chains are checked

1. Probe: Lint an invalid string title through each supported modifier on both roots and through a modifier chain.
2. Expected result: Exactly one title-format diagnostic per declaration.
3. Example: Lint `it.concurrent.only('loads the page', () => {});` and receive exactly one title-format diagnostic. The same result is required for each supported
   modifier individually.

#### AC5: Supported builders are checked

1. Probe: Lint invalid final titles through `each`, `for`, `skipIf`, and `runIf` on both roots, including combinations with modifiers. Separately lint builder calls
   without final declarations.
2. Expected result: Exactly one title-format diagnostic per final declaration and none on builder arguments or standalone builders.
3. Example: Lint `test.each(['one', 'two'])('loads %s', () => {});` and receive exactly one title-format diagnostic. Lint `test.each(['one', 'two']);` and receive none.
   The same declaration-only behavior applies to `it.only.for(['one'])('loads the page', () => {});` and `test.skipIf(true)('loads the page', () => {});`.

#### AC6: Tagged each titles are checked

1. Probe: Lint a tagged-template `each` declaration with an invalid final title, separately on both roots.
2. Expected result: Exactly one title-format diagnostic on the final declaration.
3. Example: Lint ``test.each`item\n${'one'}`('loads $item', () => {});`` and receive exactly one title-format diagnostic.

#### AC7: Non-test-case methods are excluded

1. Probe: Lint suite declarations, named steps, fixture extension helpers, and unknown methods with names or arguments outside the title format.
2. Expected result: No diagnostics from this rule.
3. Example: Lint
   `describe('checkout', () => {}); test.describe.parallel('cart', () => {}); test.step('open checkout', async () => {}); test.extend({}); test.custom('loads the page', () => {});`
   and receive no diagnostics from this rule.

#### AC8: Non-title overloads are reported

1. Probe: Separately lint calls whose first argument is absent or a non-string literal, including a runtime modifier overload.
2. Expected result: Exactly one diagnostic from this rule per call.
3. Example: Separately lint `test.skip(true, 'not supported');`, `test(42, () => {});`, `test(null, () => {});`, and `test();`. Each produces exactly one diagnostic from
   this rule.

### REQ3: Check the written title structure

Delta: added

Check string literal values against the case-sensitive regular expression `^given .+ when .+ then .+$`, without trimming or adding flags. For template literals, join
their written segments with the literal placeholder `${value}`, using each segment's `cooked` text when available and `raw` text otherwise. Do not evaluate
interpolations. Report exactly one diagnostic when title text is unavailable, including identifiers, concatenations, and function calls, even when their runtime value
could be inferred locally. Document inline rule suppression as the escape hatch for intentional dynamic titles.

Verified by: [AC9](#ac9-matching-string-titles-pass), [AC10](#ac10-nonmatching-string-titles-are-reported),
[AC11](#ac11-template-normalization-preserves-written-structure), [AC12](#ac12-unstructured-template-titles-are-reported),
[AC13](#ac13-unavailable-title-text-is-reported).

#### AC9: Matching string titles pass

1. Probe: Lint a direct declaration with a string title matching the required pattern.
2. Expected result: No diagnostics from this rule.
3. Example: Lint `test('given a cart when checkout starts then payment opens', () => {});` and receive no diagnostics from this rule.

#### AC10: Nonmatching string titles are reported

1. Probe: Lint string titles with missing sections, wrong keyword case, leading text, or an empty title.
2. Expected result: Exactly one title-format diagnostic per declaration.
3. Example: Separately lint `test('Given a cart when checkout starts then payment opens', () => {});`, `test('given a cart when checkout starts', () => {});`,
   `test('prefix given a cart when checkout starts then payment opens', () => {});`, and `test('', () => {});`. Each produces exactly one title-format diagnostic.

#### AC11: Template normalization preserves written structure

1. Probe: Check matching template titles with interpolations, without interpolations, and with escaped text requiring cooked normalization. Also exercise the supplied
   extraction fallback with a template segment whose cooked value is unavailable and raw value matches the format.
2. Expected result: Normalized matching template titles produce no diagnostics from this rule.
3. Example: Lint ``it(`given ${fixture.name} when the rule runs then it ${outcome}`, () => {});`` and receive no diagnostics regardless of interpolation values. Lint
   ``test(`\u0067iven a cart when checkout starts then payment opens`, () => {});`` and receive none. A template segment with `cooked: null` and
   `raw: 'given a cart when checkout starts then payment opens'` likewise normalizes to a matching title.

#### AC12: Unstructured template titles are reported

1. Probe: Lint a template title whose written segments and placeholders do not match the format, including one consisting only of an interpolation.
2. Expected result: Exactly one title-format diagnostic per declaration.
3. Example: Separately lint ``test(`loads ${page}`, () => {});`` and ``test(`${title}`, () => {});``. Each produces exactly one title-format diagnostic even if an
   interpolation could contain a valid runtime title.

#### AC13: Unavailable title text is reported

1. Probe: Separately lint titles supplied as identifiers, concatenations, or function calls.
2. Expected result: Exactly one diagnostic from this rule per declaration.
3. Example: Separately lint `const title = 'given a cart when checkout starts then payment opens'; test(title, () => {});`, `test('loads ' + page, () => {});`, and
   `test(makeTitle(), () => {});`. Each produces exactly one diagnostic from this rule.

### REQ4: Expose the rule under its approved name

Delta: added

Register the rule as `anti-slop/tests-require-given-when-then` in the plugin.

Verified by: [AC14](#ac14-the-rule-is-available-by-its-approved-name).

#### AC14: The rule is available by its approved name

1. Probe: Enable the approved rule name with the built plugin and lint an invalid title.
2. Expected result: Exactly one diagnostic with code `anti-slop(tests-require-given-when-then)`.
3. Example: Lint `test('loads the page', () => {});` with the approved name set to `error` and receive exactly one `anti-slop(tests-require-given-when-then)` diagnostic.

### REQ6: Document the rule and list it in the README

Delta: added

Create `docs/rules/tests-require-given-when-then.md` for human readers, explaining the behavior in REQ1 through REQ3, with valid and invalid examples and inline
suppression for intentional exceptions. Add the rule to the README's available rules list with a link to this documentation.

Verified by: [AC15](#ac15-dedicated-rule-documentation-explains-usage), [AC16](#ac16-the-readme-links-to-the-rule-documentation).

#### AC15: Dedicated rule documentation explains usage

1. Probe: Read `docs/rules/tests-require-given-when-then.md`.
2. Expected result: The document explains the agreed recognition and title handling, including valid and invalid examples and inline suppression.
3. Example: The document shows `test('loads the page', () => {});` as invalid, `test('given a cart when checkout starts then payment opens', () => {});` as valid, and
   `// oxlint-disable-next-line anti-slop/tests-require-given-when-then` as an intentional exception mechanism.

#### AC16: The README links to the rule documentation

1. Probe: Inspect the README's available rules list and follow the new rule link.
2. Expected result: The new rule has an entry that links to its dedicated documentation.
3. Example: The README lists `tests-require-given-when-then` with a link to `docs/rules/tests-require-given-when-then.md`, which exists.

### REQ7: Use the new rule in README configuration examples

Delta: modified

Before: The README's complete plugin configuration omits the new rule, and its suggested configuration uses `vitest/valid-title` for title enforcement.

Enable `anti-slop/tests-require-given-when-then` as an error in both README plugin configuration examples. Remove `vitest/valid-title` from the README's suggested
configuration and keep the surrounding explanation consistent. Leave `.oxlintrc.json` unchanged.

Verified by: [AC17](#ac17-readme-configuration-examples-use-the-new-rule).

#### AC17: README configuration examples use the new rule

1. Probe: Inspect the README's complete plugin configuration and suggested configuration examples.
2. Expected result: Both enable the new rule as an error, and neither configures `vitest/valid-title`.
3. Example: Both examples contain `"anti-slop/tests-require-given-when-then": "error"`; the suggested example no longer contains the previous `vitest/valid-title`
   configuration.

## Regression checks

### AC18: Inline suppression allows an intentional overload

1. Probe: Lint an otherwise reported runtime overload with an inline disable comment targeting this rule.
2. Expected result: No diagnostics from this rule.
3. Example: Lint the following code and receive no diagnostics from this rule:

```ts
// oxlint-disable-next-line anti-slop/tests-require-given-when-then
test.skip(true, 'not supported');
```
