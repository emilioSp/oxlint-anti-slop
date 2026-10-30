# Require given/when/then test titles

Test case titles must match `^given .+ when .+ then .+$`. The keywords are case-sensitive, and the title is not trimmed.

```ts
// Invalid
test('loads the page', () => {});

// Valid
test('given a cart when checkout starts then payment opens', () => {});
```

The rule checks calls rooted at `test` or `it` regardless of imports or local bindings. It does not follow aliases or check object methods such as `framework.test`. It
excludes suites, steps, fixture helpers, and unknown methods.

Supported modifiers are `only`, `skip`, `todo`, `fail`, `fails`, `failing`, `fixme`, `concurrent`, and `sequential`, including chains. Curried `each`, `for`, `skipIf`,
and `runIf` builders and tagged-template `each` are checked only at the final declaration, not at the builder or table.

String literals are checked directly. Template literal segments use cooked text when available, otherwise raw text, and each interpolation is represented by `${value}`
without evaluating it. Identifiers, concatenations, function calls, missing titles, and non-string literals are reported because their title text is unavailable. Runtime
modifier overloads such as `test.skip(true, 'not supported')` are also reported.

If you cannot use the required title format, explicitly disable the rule inline, as suggested by the diagnostic. This also applies to intentional dynamic titles or
runtime overloads:

```ts
// oxlint-disable-next-line anti-slop/tests-require-given-when-then
test.skip(true, 'not supported');
```
