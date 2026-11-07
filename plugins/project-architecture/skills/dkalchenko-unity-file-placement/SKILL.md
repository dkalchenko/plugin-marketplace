---
name: dkalchenko-unity-file-placement
description: Choose and review Unity file locations using the expected _Game structure, feature ownership, centralized Editor tooling, and tests that mirror source paths under Assets/_Game/Tests.
---

# Unity file placement

Identify the owning feature and its consumers before choosing a directory. Use `Assets/_Game/` as the authored game-content root for the layout below. Check applicable repository instructions before changing files. Apply the test-placement rule first, then the Editor rule, then feature ownership. Test and Editor placement take precedence over feature colocation.

## Required test location

**ALL tests belong under `Assets/_Game/Tests/`. Never place tests beside production code or in feature-local, shared-system, bootstrap, or tooling test folders outside this root.**

- Mirror the full directory path of the source file relative to `Assets/_Game/` beneath `Assets/_Game/Tests/`. Preserve directory names, casing, and nesting. Name the test file `<SourceName>Tests.cs`.
- The mapping is `Assets/_Game/<RelativeDirectory>/<SourceName>.cs` to `Assets/_Game/Tests/<RelativeDirectory>/<SourceName>Tests.cs`. This applies to every source area, not only features.

| Source path relative to `Assets/_Game/` | Test path relative to `Assets/_Game/` |
| --- | --- |
| `Features/<FeatureName>/<NestedPath>/<SourceName>.cs` | `Tests/Features/<FeatureName>/<NestedPath>/<SourceName>Tests.cs` |
| `Shared/<SystemName>/<NestedPath>/<SourceName>.cs` | `Tests/Shared/<SystemName>/<NestedPath>/<SourceName>Tests.cs` |
| `Bootstrap/<SourceName>.cs` | `Tests/Bootstrap/<SourceName>Tests.cs` |
| `Editor/<ToolName>/<SourceName>.cs` | `Tests/Editor/<ToolName>/<SourceName>Tests.cs` |
| `<SourceName>.cs` | `Tests/<SourceName>Tests.cs` |

- Placeholders describe paths, not folders to create literally. Do not flatten nested source paths or insert an `EditMode/` or `PlayMode/` prefix before the mirrored path.
- Keep test fixtures, helpers, test-only assets, and test assembly definitions or references under the same `Tests/` root. Put shared test support at the narrowest common test directory that owns its consumers. For integration tests covering multiple source files, mirror their common owning source directory and name the test file for the behavior being tested with the `Tests.cs` suffix.
- Editor-dependent tests also stay under `Tests/`, mirroring the source they test. Configure their test assemblies for Editor-only compilation. Test execution mode and Editor dependencies do not change the path mapping; configure suitable Edit Mode or Play Mode test assemblies and keep production assemblies independent of them.
- This test rule is the explicit exception to the Editor-location rule below. `Tests/Editor/` is allowed only to mirror source under `_Game/Editor/`; it contains tests and test support, never production Editor tooling. Do not put tests under `_Game/Editor/Tests/`.

## Required Editor location

**ANY non-test file containing Unity Editor code must be placed under `Assets/_Game/Editor/`. Do not create any additional folder named `Editor` for production code or tooling. The only permitted extra `Editor` folder is the test mirror `Assets/_Game/Tests/Editor/` described above.**

- This applies to custom inspectors, property drawers, Editor windows, menu commands, asset importers/processors, scene builders, build tooling, Editor initialization, and Editor-only helpers that are not test support. Feature-specific ownership does not create an exception.
- A non-test file using `UnityEditor` APIs or containing Editor-only code behind `#if UNITY_EDITOR` still belongs under `Assets/_Game/Editor/`. An Editor-only `.asmdef`, define constraint, or preprocessor guard elsewhere does not satisfy the placement rule.
- When a runtime file contains Editor code, extract that code into a separate file under `Assets/_Game/Editor/`. Keep the runtime component with its feature and free of Editor code; do not move a required runtime component into the Editor tree.
- Organize the tooling tree using ordinary subfolders such as `Editor/<Owner>/` when needed. Never use `Features/<Feature>/Editor/`, `Shared/<System>/Editor/`, or `Editor/<Feature>/Editor/`. Keep all tests in the separate `Tests/` tree.
- Keep non-test Editor assembly definitions and Editor tooling's companion assets with their code in this tree. Preserve appropriate Editor-only compilation; a folder-placement change does not replace assembly validation.
- Existing non-test Editor code outside this tree is a placement violation, not a precedent for new files. When a task includes correcting it, preserve metadata and references using the move workflow below.

## Expected Unity project structure

Open the directory containing `Assets/`, `Packages/`, and `ProjectSettings/` as the Unity project root. Paths below are relative to that root.

Use this reusable top-level layout. Feature names, shared-system categories, tooling subfolders, package-specific folders, and individual files depend on the project and are intentionally not prescribed. Create optional directories only when content needs them.

```text
<UnityProject>/
|-- Assets/
|   |-- _Game/
|   |   |-- Bootstrap/                 # Startup/composition scripts and prefabs
|   |   |-- Editor/                    # Non-test Editor code and tooling
|   |   |-- Features/                  # Project-defined feature content
|   |   |-- Shared/                    # Content used by multiple features
|   |   |-- Scenes/                    # Entry scenes and scene-exclusive assets
|   |   |-- Settings/                  # Authored project-wide settings assets
|   |   |-- Tests/                     # ALL tests; mirror source paths under _Game
|   |   `-- Sandbox/                   # Prototypes and experimental scenes
|   `-- ThirdParty/                   # Movable external asset imports
|-- Design/                           # Design references, notes and QA materials
|-- Packages/                         # Package manifests, lockfile and dependencies
`-- ProjectSettings/                  # Unity-managed project configuration
```

`Library/`, `Temp/`, `Logs/`, `obj/`, generated `.csproj` and solution files, and build output are not authored-content destinations. `UserSettings/` contains local preferences. Keep IDE configuration separate from game content. Keep design documents and QA captures under the project-root `Design/` area unless the game imports them as assets.

## Placement by ownership

Destinations below are relative to `Assets/_Game/` unless a project-root path is stated explicitly. Apply the test rule first, then the Editor rule, then choose the owner for runtime code and other assets.

| File ownership | Placement rule |
| --- | --- |
| One feature | Group its scripts, prefabs, configuration, art, and feature-specific screens under `Features/<Feature>/`. Introduce type subfolders when navigation requires them. |
| One UI component | Keep its C# binding, UXML layout, and USS stylesheet together in the owning feature. Reuse across views of the same feature stays local. |
| Multiple features | Place genuinely shared content under `Shared/<SystemOrCategory>/` and reference the same asset from each consumer. |
| Startup composition | Keep game startup scripts and composition prefabs in `Bootstrap/`. Feature behavior stays with its feature. |
| Scene composition | Keep entry scenes in `Scenes/` and scene-exclusive assets beside their scene. Keep reusable feature prefabs with their owner. |
| Global configuration | Place authored settings assets in `Settings/`. Keep Unity-managed configuration in the root `ProjectSettings/` directory. |
| Non-test Editor code | Use only `Editor/` and its ordinary subfolders, including feature-specific tooling. The sole extra `Editor` directory allowed is the test mirror `Tests/Editor/`. |
| Tests | Put ALL tests under `Tests/`, repeating the source file's directory path relative to `_Game/` and using `<SourceName>Tests.cs`. Editor-dependent tests follow the same mapping. Never colocate tests with production files. |
| Experiments | Keep prototypes in `Sandbox/` and exclude experimental scenes from the build scene list. |
| External content | Keep movable asset imports together under project-root `Assets/ThirdParty/<VendorOrPack>/`. Preserve required vendor asset paths, manage package dependencies through project-root `Packages/`, and keep authored variants near their consumers. These asset destinations do not permit authored Editor code outside `_Game/Editor/`. |
| Design and QA materials | Keep references, notes, and captures under project-root `Design/<Feature>/` unless the game consumes them. |

Reserve Unity special folders for their engine-defined purpose. Check placement constraints for the Unity version in use before adding runtime resources or package-required assets. The test rule is the sole exception to the Editor code and folder restrictions above.

## Moving assets

- Identify serialized references, string paths, UXML and USS imports, Resources keys, Editor tools, and build scenes that depend on the old path.
- For Editor migrations, include companion assets and assembly definitions, check references to the runtime assemblies, and remove the vacated disallowed `Editor` directory and its metadata only after confirming it is empty.
- For test migrations or source moves, update the test path to mirror the source path under `Tests/`. Preserve test metadata and update assembly references, test discovery, and path-based consumers.
- Move the asset and its metadata together through Unity's Project window or `AssetDatabase.MoveAsset`. Preserve the GUID and check the move result. If working outside Unity, use a metadata-preserving move.
- Update path-based consumers and verify the affected imports, scene bindings, and build settings. Limit changes to the requested files and their consumers.

## Placement review

- Check file contents, not just names or folder labels, for Editor dependencies and conditional Editor code. Searching for `UnityEditor` and `UNITY_EDITOR` is a useful starting point, not a complete classification.
- Confirm every test is under `Assets/_Game/Tests/`, its path mirrors the source it tests, and its filename ends in `Tests.cs`. Check for stray tests under `Features/`, `Shared/`, `Bootstrap/`, and `Editor/`.
- Confirm non-test Editor code is under `Assets/_Game/Editor/`. Permit `Tests/Editor/` only as the source-path mirror and verify Editor-dependent test assemblies are isolated from player code.
- Confirm runtime components remain available to the player, Editor assemblies stay isolated, and affected tests still run in their intended mode after any move or split.
