---
name: dkalchenko-unity-stale-files
description: Identify and remove unused files in a Unity project when a change retires or replaces a file or the user asks for a stale-file cleanup.
---

# Unity stale files

Check assets and files that lose consumers after a replacement or removal. For example, a retired prefab can leave an unused material or texture. Reserve a project-wide sweep for an explicit cleanup request. This skill covers whole files and their Unity references; unused members inside a retained script are a code-reachability concern.

Trace references across the project by path, name, and the GUID from the asset's `.meta` file. Check scenes, prefabs, and build settings, including scenes used only by tests or Editor tools. Account for indirect consumers such as `Resources.Load` keys, Addressables addresses or labels, and files read from StreamingAssets. For binary assets, inspect dependencies in the Unity Editor.

Retain the file and metadata when a concrete consumer or known planned use remains unresolved. Report its path and the missing evidence; ask for a decision only if it is needed to finish the requested cleanup. Do not ask about hypothetical future uses of otherwise confirmed stale files.

Remove confirmed stale assets through Unity's asset tools when available. When working on disk, delete the asset and its matching `.meta` file together. Verify the affected import, scene, or build for missing references.
