---
name: dkalchenko-unity-file-placement
description: Choose and review locations for Unity scripts, UI components, scenes, assets, Editor tools, and tests based on ownership and Unity folder semantics.
---

# Unity file placement

Identify the owning feature and its consumers before choosing a directory. Follow applicable repository instructions and the existing authored-content root. Use the following destinations relative to that root unless Unity or a package requires a specific path.

| File ownership | Placement rule |
| --- | --- |
| One feature | Group its scripts, prefabs, configuration, art, and feature-specific screens under `Features/<Feature>/`. Introduce type subfolders when navigation requires them. |
| One UI component | Keep its C# binding, UXML layout, and USS stylesheet together in the owning feature. Reuse across views of the same feature stays local. |
| Multiple features | Place genuinely shared content under `Shared/<SystemOrCategory>/` and reference the same asset from each consumer. |
| Scene composition | Keep entry scenes in `Scenes/` and scene-exclusive assets beside their scene. Keep reusable feature prefabs with their owner. |
| Global configuration | Place authored settings assets in `Settings/`. Keep Unity-managed configuration in the root `ProjectSettings/` directory. |
| Editor tools | Use the feature's `Editor/` directory for feature tooling and the common `Editor/` directory for tools used across the game. |
| Tests | Keep feature checks near their feature and cross-feature checks in `Tests/`. Configure suitable Edit Mode or Play Mode test assemblies. |
| Experiments | Keep prototypes in `Sandbox/` and exclude experimental scenes from the build scene list. |
| External content | Keep movable imports together under `Assets/ThirdParty/<VendorOrPack>/`. Preserve required vendor paths, manage package dependencies through `Packages/`, and keep authored variants near their consumers. |
| Design and QA materials | Keep references and captures outside the imported asset tree unless the game consumes them. |

Reserve Unity special folders for their engine-defined purpose. Check placement constraints for the Unity version in use, especially for Editor code and runtime resources. Keep authored assets outside caches, generated build output, and local user settings.

## Moving assets

- Identify serialized references, string paths, UXML and USS imports, Resources keys, Editor tools, and build scenes that depend on the old path.
- Move the asset and its metadata together through Unity's Project window or `AssetDatabase.MoveAsset`. Preserve the GUID and check the move result. If working outside Unity, use a metadata-preserving move.
- Update path-based consumers and verify the affected imports, scene bindings, and build settings. Limit changes to the requested files and their consumers.
