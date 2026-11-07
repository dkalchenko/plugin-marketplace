---
name: dkalchenko-unity-file-placement
description: Choose and review Unity file locations using the expected _Game structure, feature ownership, and the single Assets/_Game/Editor location for all Editor code.
---

# Unity file placement

Identify the owning feature and its consumers before choosing a directory. Use `Assets/_Game/` as the authored game-content root for the layout below. Check applicable repository instructions before changing files. The Editor rule takes precedence over feature colocation and the other placement rules in this skill.

## Required Editor location

**ANY file containing Unity Editor code must be placed under `Assets/_Game/Editor/`. This is the only allowed `Editor` folder. Do not create any additional folder named `Editor` anywhere in the project, including inside features, shared systems, tests, or the existing Editor tree.**

- This applies to custom inspectors, property drawers, Editor windows, menu commands, asset importers/processors, scene builders, build tooling, Editor initialization, Editor-only helpers, and tests containing Editor code. Feature-specific ownership does not create an exception.
- A file using `UnityEditor` APIs or containing Editor-only code behind `#if UNITY_EDITOR` still belongs under `Assets/_Game/Editor/`. An Editor-only `.asmdef`, define constraint, or preprocessor guard elsewhere does not satisfy the placement rule.
- When a runtime file contains Editor code, extract that code into a separate file under `Assets/_Game/Editor/`. Keep the runtime component with its feature and free of Editor code; do not move a required runtime component into the Editor tree.
- Organize the single Editor tree using ordinary subfolders such as `Editor/<Owner>/` or `Editor/Tests/<Owner>/` when needed. Never use `Features/<Feature>/Editor/`, `Shared/<System>/Editor/`, `Tests/Editor/`, or `Editor/<Feature>/Editor/`.
- Keep Editor-only assembly definitions and Editor tooling's companion assets with their code in this tree. Preserve appropriate Editor-only compilation and test configuration; a folder-placement change does not replace assembly validation.
- Existing Editor code outside this tree is a placement violation, not a precedent for new files. When a task includes correcting it, preserve metadata and references using the move workflow below.

## Expected Unity project structure

Open the directory containing `Assets/`, `Packages/`, and `ProjectSettings/` as the Unity project root. Paths below are relative to that root.

Use this reusable top-level layout. Feature names, shared-system categories, tooling subfolders, package-specific folders, and individual files depend on the project and are intentionally not prescribed. Create optional directories only when content needs them.

```text
<UnityProject>/
|-- Assets/
|   |-- _Game/
|   |   |-- Bootstrap/                 # Startup/composition scripts and prefabs
|   |   |-- Editor/                    # ALL Editor code; the only Editor folder
|   |   |-- Features/                  # Project-defined feature content
|   |   |-- Shared/                    # Content used by multiple features
|   |   |-- Scenes/                    # Entry scenes and scene-exclusive assets
|   |   |-- Settings/                  # Authored project-wide settings assets
|   |   |-- Tests/                     # Cross-feature tests without Editor code
|   |   `-- Sandbox/                   # Prototypes and experimental scenes
|   `-- ThirdParty/                   # Movable external asset imports
|-- Design/                           # Design references, notes and QA materials
|-- Packages/                         # Package manifests, lockfile and dependencies
`-- ProjectSettings/                  # Unity-managed project configuration
```

`Library/`, `Temp/`, `Logs/`, `obj/`, generated `.csproj` and solution files, and build output are not authored-content destinations. `UserSettings/` contains local preferences. Keep IDE configuration separate from game content. Keep design documents and QA captures under the project-root `Design/` area unless the game imports them as assets.

## Placement by ownership

Destinations below are relative to `Assets/_Game/` unless a project-root path is stated explicitly. Apply the Editor rule first, then choose the owner for runtime code and other assets.

| File ownership | Placement rule |
| --- | --- |
| One feature | Group its scripts, prefabs, configuration, art, and feature-specific screens under `Features/<Feature>/`. Introduce type subfolders when navigation requires them. |
| One UI component | Keep its C# binding, UXML layout, and USS stylesheet together in the owning feature. Reuse across views of the same feature stays local. |
| Multiple features | Place genuinely shared content under `Shared/<SystemOrCategory>/` and reference the same asset from each consumer. |
| Startup composition | Keep game startup scripts and composition prefabs in `Bootstrap/`. Feature behavior stays with its feature. |
| Scene composition | Keep entry scenes in `Scenes/` and scene-exclusive assets beside their scene. Keep reusable feature prefabs with their owner. |
| Global configuration | Place authored settings assets in `Settings/`. Keep Unity-managed configuration in the root `ProjectSettings/` directory. |
| Any Editor code | Use only `Editor/` and its ordinary subfolders, including feature-specific tooling and Editor-dependent tests. Never add another `Editor` folder. |
| Tests | Put every test containing Editor code in `Editor/Tests/<Owner>/`. Tests without Editor code may stay in `Features/<Feature>/Tests/` or, for cross-feature checks, `Tests/`. Configure suitable Edit Mode or Play Mode test assemblies. |
| Experiments | Keep prototypes in `Sandbox/` and exclude experimental scenes from the build scene list. |
| External content | Keep movable asset imports together under project-root `Assets/ThirdParty/<VendorOrPack>/`. Preserve required vendor asset paths, manage package dependencies through project-root `Packages/`, and keep authored variants near their consumers. These asset destinations do not permit authored Editor code outside `_Game/Editor/`. |
| Design and QA materials | Keep references, notes, and captures under project-root `Design/<Feature>/` unless the game consumes them. |

Reserve Unity special folders for their engine-defined purpose. Check placement constraints for the Unity version in use before adding runtime resources or package-required assets. This does not permit additional `Editor` folders or Editor code outside `Assets/_Game/Editor/`.

## Moving assets

- Identify serialized references, string paths, UXML and USS imports, Resources keys, Editor tools, and build scenes that depend on the old path.
- For Editor migrations, include companion assets and assembly definitions, check references to the runtime assemblies, and remove the vacated disallowed `Editor` directory and its metadata only after confirming it is empty.
- Move the asset and its metadata together through Unity's Project window or `AssetDatabase.MoveAsset`. Preserve the GUID and check the move result. If working outside Unity, use a metadata-preserving move.
- Update path-based consumers and verify the affected imports, scene bindings, and build settings. Limit changes to the requested files and their consumers.

## Placement review

- Check file contents, not just names or folder labels, for Editor dependencies and conditional Editor code. Searching for `UnityEditor` and `UNITY_EDITOR` is a useful starting point, not a complete classification.
- Confirm every file containing Editor code is under `Assets/_Game/Editor/` and no additional `Editor` directory was introduced.
- Confirm runtime components remain available to the player, Editor assemblies stay isolated, and affected tests still run in their intended mode after any move or split.
