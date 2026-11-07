---
name: dkalchenko-unity-assemblies
description: Decide when Unity scripts need a new assembly and create, update, or review .asmdef and .asmref assets, including their references, platform filters, and test boundaries.
---

# Unity assemblies

## Choose the owning assembly

| Need | Rule |
| --- | --- |
| New scripts fit an existing assembly's dependencies, platforms, and consumers | Keep them in that assembly. A new feature, namespace, or folder alone is insufficient reason to split it. |
| A separate folder should compile into an existing assembly | Use an Assembly Definition Reference (`.asmref`) targeting the owner. To use types across two existing assemblies, add a reference to the consumer's `.asmdef` instead. |
| A group of scripts needs independent platform support, Editor or test isolation, a reusable package boundary, or an enforced dependency direction | Reuse a suitable assembly if available. Otherwise create an Assembly Definition (`.asmdef`) at the narrowest folder that owns the group. |
| Faster iteration is the reason for a split | Identify which scripts change together and which consumers would recompile. Split only if the new dependency graph reduces the affected compilation work. |

## Create or update the definition

1. **Map scope first.** Identify the current owner of each affected script. A definition or reference covers its folder and descendants up to a nested definition or reference. Check child `Editor/` and test folders before introducing a parent definition. Inspect both dependencies and consumers, including scripts in predefined assemblies.
2. **Edit the asset that owns the change.** Give a new assembly a unique name consistent with neighboring assemblies. Update an existing definition in place and preserve unrelated settings. Keep its `.meta` GUID on moves and renames. For an assembly-name change, also update name-based references, friend assemblies, reflection lookups, and serialized assembly-qualified type names where used.
3. **Wire references from consumer to provider.** Add only direct dependencies required by compiled code. Match the existing reference format and prefer GUIDs for new definitions. Resolve GUIDs from actual assets. Keep the graph acyclic. If two assemblies require each other, move the shared contract to a lower dependency or keep the mutually dependent types together. A custom assembly cannot reference types left in a predefined assembly such as `Assembly-CSharp`.
4. **Set compilation conditions deliberately.** Ensure each dependency is available wherever its consumer compiles. Use either platform inclusions or exclusions. When a parent definition captures Editor scripts, assign them to an Editor-only assembly. ALL tests and their test assembly definitions or references belong under `Assets/_Game/Tests/`, with test files mirroring their source paths relative to `Assets/_Game/`. Configure test assemblies for the intended Edit Mode or Play Mode target, referencing the code under test. Editor-dependent tests remain in this test tree with Editor-only compilation; `Tests/Editor/` mirrors production tooling under `_Game/Editor/`. Keep production assemblies independent of test assemblies. Do not move tests into a feature folder or `_Game/Editor/Tests/` to satisfy an assembly boundary.
5. **Change flags only for the dependency they control.** `autoReferenced` affects references *from predefined assemblies*. `overrideReferences` selects precompiled DLL dependencies. Use `defineConstraints` to conditionally compile an assembly and `versionDefines` to supply version-dependent symbols. Check both enabled and disabled configurations when changing those conditions.

## Verify the change

- Let Unity import the assets. Check that the intended scripts belong to the expected assemblies and that affected consumers compile without missing references or cycles.
- Run the affected test assemblies when test boundaries change. When platform or Editor boundaries change, verify an affected player target as well as Editor compilation.
- After renaming an assembly or moving types between assemblies, check affected serialized assets and name-based lookups. Report which configurations were verified and which still need Unity validation.
