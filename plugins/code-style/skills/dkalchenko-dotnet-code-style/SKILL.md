---
name: dkalchenko-dotnet-code-style
description: Apply or review C# naming and formatting, using project conventions first and a Microsoft-based baseline where they are silent.
---

# .NET Code Style

Use the baseline below for C# where the project has no established rule. This is an adaptation of Microsoft guidance, not a claim that all Microsoft projects use one style.

## Resolve the project style

- Inspect applicable repository instructions, `.editorconfig`, analyzer settings, language version, and nearby code before editing. Explicit user requirements and project rules override this baseline; follow the surrounding style where configuration is silent.
- Apply style to new and changed code. Keep unrelated files and lines out of the diff unless a broader cleanup was requested. Leave generated and vendored code alone.
- Preserve behavior and compatibility. Public API renames, serialized names, reflection targets, and framework-required names need compatibility analysis; do not change them merely to satisfy naming preferences.

## Baseline

- Use four spaces and Allman braces, including braces around single-statement control-flow bodies. Keep statements and declarations on separate lines; avoid trailing whitespace and repeated blank lines. Put spaces around binary operators and after commas.
- Use one blank line between methods, between independent control-flow statements and distinct `switch` sections, between logical code blocks within a method, and between groups of related fields or properties. Keep declarations within the same field or property group together without intervening blank lines.
- Keep connected `if`/`else if`/`else` branches together as one statement. Place `else if` and `else` on the line immediately after the preceding closing brace, with no intervening blank line.
- Do not nest ternary conditional expressions (`?:`) inside one another. Use `if`/`else` for the outer decision; a single non-nested ternary may remain within a branch. Preserve the original evaluation order and behavior.
- Use PascalCase for types, methods, properties, and constants; camelCase for parameters and locals; `I` for interfaces; `_camelCase` for private/internal instance fields, `s_camelCase` for their static fields, and `t_camelCase` for thread-static fields. Prefer descriptive names.
- For action delegate members and events, use `On{Condition}Event`, for example `OnUserCreationEvent`. Keep `On` and `Event` literal and describe the triggering condition in PascalCase. This is the action/event exception to the general field-prefix rules.
- For test methods, use `{class/method}_should_{what to do}_{when}_{condition}`: `{ClassOrMethod}_should_{ExpectedBehavior}_When_{Condition}`. Name the class or method under test, the expected behavior, and the condition. Keep `should` lowercase and `When` literal, use PascalCase within each descriptive segment, and separate segments with underscores. For example, `CalculateTotal_should_ReturnZero_When_CartIsEmpty`. This is the test-method exception to the general PascalCase method rule.
- Declare accessibility explicitly where supported. Put it before other modifiers. Prefer `readonly` for fields that are not reassigned. Avoid unnecessary `this.`.
- Put imports outside namespaces, with `System` imports first and other imports alphabetized. Match the project's namespace syntax.
- Use C# type keywords such as `int` and `string`. Use `var` when the initializer makes the type clear; use an explicit type for an opaque method result. Do not combine `var` with target-typed `new()`.
- Use interpolation for short composed strings and `nameof` for references to symbol names.
- Explain intent in comments rather than narrating syntax. Put ordinary comments on their own line with a space after `//`.
- Use language features supported by the project's compiler and target. Do not upgrade language versions for style.

Read [rules and examples](references/rules-and-examples.md) when explaining the conventions or resolving an ambiguous application. It includes the authoritative sources and the baseline's deliberate choices.

## Readability

- Name complex conditions by intent. Use a property for a cheap, side-effect-free state predicate, a method for a parameterized check, or a local boolean for a check used only in that block. Keep simple conditions inline and preserve short-circuit evaluation.
- Split hard-to-read validation into coherent checks for identity, structure, limits, or content. Name helpers by what they validate and give failures specific messages. Preserve boundary validation and its evaluation order; do not add a helper for every comparison.
- Keep shared feature policy constants in the existing feature constants class, including their use in API defaults. Keep implementation-only constants local and do not combine unrelated features' constants.
- Extract presentation mappings in extensions. Put value-to-label or value-to-display mappings in focused extension methods within the presentation layer, and call them from views. Preserve localization and fallback behavior; keep business decisions and state changes out of mapping extensions.
- Explain deliberately surprising operations with a short why comment when the code alone hides their purpose, such as ignoring a return value from a call that validates by throwing.

## Apply or review

For edits, use existing formatting/analyzer tooling if available and scope it to the requested changes. Do not install tooling, add configuration, or rewrite a repository just to enforce this skill unless requested. Inspect the resulting diff for accidental behavioral changes.

For reviews, identify concrete locations and suggested corrections. Distinguish project requirements from baseline suggestions; cosmetic preferences are not correctness defects.
