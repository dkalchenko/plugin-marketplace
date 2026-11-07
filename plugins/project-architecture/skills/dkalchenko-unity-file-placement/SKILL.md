---
name: dkalchenko-unity-file-placement
description: Place or move Unity files using the _Game layout, centralized Editor tooling, and tests that mirror source paths.
---

# Unity file placement

Use `Assets/_Game/` as this marketplace's authored-content convention; it is not a Unity engine requirement. Read applicable project instructions, then classify files as tests, non-test Editor code, or other content, in that order.

## Tests

**ALL tests belong under `Assets/_Game/Tests/`.** Mirror the tested file's directory path relative to `Assets/_Game/`, preserving names, casing, and nesting. Use `<SourceName>Tests.cs`.

| Source relative to `Assets/_Game/` | Test relative to `Assets/_Game/` |
| --- | --- |
| `Features/<FeatureName>/<NestedPath>/<SourceName>.cs` | `Tests/Features/<FeatureName>/<NestedPath>/<SourceName>Tests.cs` |
| `Shared/<SystemName>/<SourceName>.cs` | `Tests/Shared/<SystemName>/<SourceName>Tests.cs` |
| `Editor/<ToolName>/<SourceName>.cs` | `Tests/Editor/<ToolName>/<SourceName>Tests.cs` |

Apply the same mapping to every source area, including Bootstrap and files directly under `_Game/`. Placeholders are not literal directories. Do not flatten paths, insert an `EditMode/` or `PlayMode/` prefix, or put tests beside production files.

Keep fixtures, helpers, test-only assets, and test assembly definitions/references under this root. Shared test support belongs at its consumers' narrowest common test directory. Integration tests mirror the common owning source directory and use `<BehaviorName>Tests.cs`.

Editor-dependent tests follow the same mapping and need Editor-only test assemblies. Execution mode does not change their location. `Tests/Editor/` is the sole exception to the Editor-folder restriction below: it mirrors production tooling and must contain only tests and test support.

## Editor code

**Every non-test file containing Unity Editor code belongs under `Assets/_Game/Editor/`. No additional `Editor` folder is allowed except `Assets/_Game/Tests/Editor/`.**

- This includes inspectors, drawers, windows, menu commands, import/build tools, scene builders, initialization, and non-test Editor helpers. Feature ownership does not exempt them.
- `UnityEditor` APIs and code guarded by `#if UNITY_EDITOR` count. An Editor-only assembly or preprocessor guard elsewhere does not satisfy placement.
- Extract Editor behavior from mixed runtime files into this tree; keep required runtime components with their owner.
- Use ordinary subfolders such as `Editor/<Owner>/`, with tooling assets and assembly definitions beside their code. Do not create nested or feature-local `Editor` folders.
- Existing violations do not justify new ones. Correct them only within the requested scope.

## Project layout

Open the directory containing `Assets/`, `Packages/`, and `ProjectSettings/` as the Unity project root. This layout specifies no feature names or project-specific files; create optional directories only when content needs them.

```text
<UnityProject>/
|-- Assets/
|   |-- _Game/
|   |   |-- Bootstrap/
|   |   |-- Editor/
|   |   |-- Features/
|   |   |-- Shared/
|   |   |-- Scenes/
|   |   |-- Settings/
|   |   |-- Tests/
|   |   `-- Sandbox/
|   `-- ThirdParty/
|-- Design/
|-- Packages/
`-- ProjectSettings/
```

For content not covered by the test or Editor rules, use these destinations relative to `Assets/_Game/` unless stated otherwise:

| Owner or purpose | Destination |
| --- | --- |
| One feature | `Features/<Feature>/` for its runtime scripts, prefabs, configuration, art, and screens. Add type subfolders only when useful. |
| One UI component | Keep its C# binding, UXML, and USS together with its feature; reuse within that feature stays local. |
| Multiple features | `Shared/<SystemOrCategory>/`; reference shared assets rather than duplicating them. |
| Startup composition | `Bootstrap/` for startup scripts and composition prefabs. |
| Scene composition | `Scenes/` for entry scenes and scene-exclusive assets; reusable prefabs stay with their feature. |
| Global configuration | `Settings/` for authored settings; Unity-managed configuration stays in project-root `ProjectSettings/`. |
| Experiments | `Sandbox/`; exclude experimental scenes from build settings. |
| External content | Project-root `Assets/ThirdParty/<VendorOrPack>/` for movable imports. Preserve required vendor asset paths; manage packages through `Packages/`. Keep authored variants with their consumers. |
| Design and QA | Project-root `Design/`, outside imported assets unless the game consumes them. |

Reserve Unity special folders for their documented purpose and check version/package constraints before using them. Keep authored content out of `Library/`, `Temp/`, `Logs/`, `obj/`, `UserSettings/`, generated project files, and build output.

## Moves and renames

1. Identify consumers of the old path: serialized references, string paths, UXML/USS imports, Resources keys, Editor tools, and build scenes.
2. Move or rename through Unity's Project window or `AssetDatabase.MoveAsset`; otherwise preserve the asset and its `.meta` together. Keep the GUID. A script-type or assembly-name change needs separate compatibility checks.
3. Keep companion assets, test mirrors, and assembly definitions/references aligned. Remove a vacated disallowed Editor folder and its metadata only after verifying it is empty.
4. Update path-based consumers and verify imports, scene bindings, build settings, and affected tests. Check Editor/player assembly isolation when compilation boundaries change.

For new files and reviews, inspect contents as well as paths: `UnityEditor` and `UNITY_EDITOR` searches are starting points, not a complete classification. Check test filenames and mirrored paths, and keep changes within the requested scope.
