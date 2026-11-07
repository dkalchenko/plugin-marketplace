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
- Use PascalCase for types, methods, properties, and constants; camelCase for parameters and locals; `I` for interfaces; `_camelCase` for private/internal instance fields, `s_camelCase` for their static fields, and `t_camelCase` for thread-static fields. Prefer descriptive names.
- Declare accessibility explicitly where supported. Put it before other modifiers. Prefer `readonly` for fields that are not reassigned. Avoid unnecessary `this.`.
- Put imports outside namespaces, with `System` imports first and other imports alphabetized. Match the project's namespace syntax.
- Use C# type keywords such as `int` and `string`. Use `var` when the initializer makes the type clear; use an explicit type for an opaque method result. Do not combine `var` with target-typed `new()`.
- Use interpolation for short composed strings and `nameof` for references to symbol names.
- Explain intent in comments rather than narrating syntax. Put ordinary comments on their own line with a space after `//`.
- Use language features supported by the project's compiler and target. Do not upgrade language versions for style.

Read [rules and examples](references/rules-and-examples.md) when explaining the conventions or resolving an ambiguous application. It includes the authoritative sources and the baseline's deliberate choices.

## Apply or review

For edits, use existing formatting/analyzer tooling if available and scope it to the requested changes. Do not install tooling, add configuration, or rewrite a repository just to enforce this skill unless requested. Inspect the resulting diff for accidental behavioral changes.

For reviews, identify concrete locations and suggested corrections. Distinguish project requirements from baseline suggestions; cosmetic preferences are not correctness defects.
