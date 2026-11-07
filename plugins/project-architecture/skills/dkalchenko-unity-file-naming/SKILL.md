---
name: dkalchenko-unity-file-naming
description: Choose or review names for Unity script files, UI Toolkit companions, scenes, authored assets, and their folders when creating or renaming files.
---

# Unity file naming

- Follow the naming conventions in the owning directory. For new authored feature and component folders and C# file stems, default to descriptive PascalCase.
- Give a C# file the name of its principal type. Keep MonoBehaviour and ScriptableObject script names aligned with their types. Closely related helper types may share the principal type's file.
- Name a source-focused test file and its principal type `<SourceName>Tests`, with `.cs` on the file. Use `<BehaviorName>Tests` for integration tests. Apply the [test placement rule](../dkalchenko-unity-file-placement/SKILL.md#tests) when choosing or changing their paths.
- Give a UI component's folder, C# binding, UXML layout, and USS stylesheet the same stem. Preserve extension casing. Name independently reusable themes and panel settings by their own roles.
- Add a role suffix only when it describes the file's responsibility. Use terms such as `Controller` for coordination, `Catalog` for a collection of authored definitions, and `Builder` for authoring automation.
- Name scenes and authored assets by purpose or content. Distinguish variants with meaningful qualifiers. Follow established naming families for platform settings, prefixes, and separators.
- Preserve vendor names, license filenames, Unity-reserved folder names, and engine-managed filenames. Match path casing in every reference and check for case-only collisions.
- Preserve existing namespaces and assembly names when organizing files. Rename UXML element names, USS selectors, and persistence keys only when the requested change includes those contracts.

## Renaming existing files

Use the [move and rename procedure](../dkalchenko-unity-file-placement/SKILL.md#moves-and-renames) to preserve GUIDs and update path-based consumers. A principal-type rename also needs a serialization migration plan; changing a filename alone does not migrate type identities.
