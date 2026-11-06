---
name: dkalchenko-unity-file-naming
description: Choose or review names for Unity script files, UI Toolkit companions, scenes, authored assets, and their folders when creating or renaming files.
---

# Unity file naming

- Follow the naming conventions in the owning directory. For new authored feature and component folders and C# file stems, default to descriptive PascalCase.
- Give a C# file the name of its principal type. Keep MonoBehaviour and ScriptableObject script names aligned with their types. Closely related helper types may share the principal type's file.
- Give a UI component's folder, C# binding, UXML layout, and USS stylesheet the same stem. Preserve extension casing. Name independently reusable themes and panel settings by their own roles.
- Add a role suffix only when it describes the file's responsibility. Use terms such as `Controller` for coordination, `Catalog` for a collection of authored definitions, and `Builder` for authoring automation.
- Name scenes and authored assets by purpose or content. Distinguish variants with meaningful qualifiers. Follow established naming families for platform settings, prefixes, and separators.
- Preserve vendor names, license filenames, Unity-reserved folder names, and engine-managed filenames. Match path casing in every reference and check for case-only collisions.
- Preserve existing namespaces and assembly names when organizing files. Rename UXML element names, USS selectors, and persistence keys only when the requested change includes those contracts.

## Renaming existing files

Identify the old and proposed names and all consumers before a rename. Check script type identity, serialized references, UXML and USS imports, Resources keys, and Editor path constants. Preserve the asset's `.meta` file and GUID through a Unity-aware rename. When the principal type also changes, plan its serialization migration separately. Verify affected imports, compilation, and scene bindings after the rename.
