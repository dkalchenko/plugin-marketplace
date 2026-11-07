---
name: dkalchenko-unity-assemblies
description: Decide when Unity scripts need a new assembly and review .asmdef and .asmref assets, references, platform filters, and the single shared test assembly.
---

# Unity assemblies

## Choose the owning assembly

| Need | Rule |
| --- | --- |
| Tests or test support | Use the [single test assembly](#single-test-assembly); the general split criteria below do not apply. |
| New scripts fit an existing assembly's dependencies, platforms, and consumers | Keep them in that assembly. A new feature, namespace, or folder alone is insufficient reason to split it. |
| A separate folder should compile into an existing assembly | Use an Assembly Definition Reference (`.asmref`) targeting the owner. To use types across two existing assemblies, add a reference to the consumer's `.asmdef` instead. |
| A group of production scripts needs independent platform support, Editor isolation, a reusable package boundary, or an enforced dependency direction | Reuse a suitable assembly if available. Otherwise create an Assembly Definition (`.asmdef`) at the narrowest folder that owns the group. |
| Faster iteration is the reason for a split | Identify which scripts change together and which consumers would recompile. Split only if the new dependency graph reduces the affected compilation work. |

## Single test assembly

**All tests under `Assets/_Game/Tests/` must compile into exactly one test assembly.** Keep its sole `.asmdef` directly in `Assets/_Game/Tests/`, using the existing assembly name and GUID when available.

- Include every test and test helper in the entire subtree, including mirrored feature, shared, bootstrap, and Editor paths. Do not create additional test assemblies by feature, layer, category, or execution mode.
- Do not add nested `.asmdef` files or `.asmref` assets that redirect test code to another assembly. Mirrored folders organize files; they do not create compilation boundaries.
- Mark the root definition as a test assembly and add the production references needed by all its tests. Production assemblies must not reference it.
- If any tests require Editor-only dependencies, configure this shared assembly as Editor-only. Check the installed Test Framework's execution-mode support and report incompatible requirements; do not silently create a second assembly to accommodate them.

## Create or update the definition

Use the [placement rules](../dkalchenko-unity-file-placement/SKILL.md) for Editor code and the mirrored test tree. Assembly boundaries must support those locations, not relocate tests beside production code.

1. **Map scope first.** Identify the current owner of each affected script. A definition or reference covers its folder and descendants up to a nested definition or reference. Check child `Editor/` and test folders before introducing a parent definition. Inspect both dependencies and consumers, including scripts in predefined assemblies.
2. **Edit the asset that owns the change.** Give a new assembly a unique name consistent with neighboring assemblies. Update an existing definition in place and preserve unrelated settings. Keep its `.meta` GUID on moves and renames. For an assembly-name change, also update name-based references, friend assemblies, reflection lookups, and serialized assembly-qualified type names where used.
3. **Wire references from consumer to provider.** Add only direct dependencies required by compiled code. Match the existing reference format and prefer GUIDs for new definitions. Resolve GUIDs from actual assets. Keep the graph acyclic. If two assemblies require each other, move the shared contract to a lower dependency or keep the mutually dependent types together. A custom assembly cannot reference types left in a predefined assembly such as `Assembly-CSharp`.
4. **Set compilation conditions deliberately.** Ensure each dependency is available wherever its consumer compiles. Use either platform inclusions or exclusions. Isolate Editor-dependent production code in Editor-only assemblies; apply the single-test-assembly rule above to tests.
5. **Change flags only for the dependency they control.** `autoReferenced` affects references *from predefined assemblies*. `overrideReferences` selects precompiled DLL dependencies. Use `defineConstraints` to conditionally compile an assembly and `versionDefines` to supply version-dependent symbols. Check both enabled and disabled configurations when changing those conditions.

## Verify the change

- Let Unity import the assets. Check that the intended scripts belong to the expected assemblies and that affected consumers compile without missing references or cycles.
- Verify that the entire `Assets/_Game/Tests/` tree contains exactly one `.asmdef` at its root and that every test script belongs to it. Run affected tests from that assembly when its configuration changes. When production platform or Editor boundaries change, verify an affected player target as well as Editor compilation.
- After renaming an assembly or moving types between assemblies, check affected serialized assets and name-based lookups. Report which configurations were verified and which still need Unity validation.
