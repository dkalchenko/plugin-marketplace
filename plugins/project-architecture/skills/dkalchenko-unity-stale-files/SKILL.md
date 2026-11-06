---
name: dkalchenko-unity-stale-files
description: Identify and remove unused files in a Unity project when a change retires or replaces a file or the user asks for a stale-file cleanup.
---

# Unity stale files

Start with files the affected feature used to depend on. For example, replacing a prefab can leave behind a material or texture that only the old prefab used. Check each file for other consumers before removing it. Keep a wider project sweep for an explicit cleanup request.

Trace references across the project by path, name, and the GUID from the asset's `.meta` file. Check scenes, prefabs, and build settings, including scenes used only by tests or Editor tools. Account for indirect consumers such as `Resources.Load` keys, Addressables addresses or labels, and files read from StreamingAssets. For binary assets, inspect dependencies in the Unity Editor.

If current or planned use is unclear, ask the user whether to keep or delete the file. Give its path, summarize what you checked, and explain the uncertainty. Keep the file and its metadata in place until the user confirms deletion.

Remove confirmed stale assets through Unity's asset tools when available. When working on disk, delete the asset and its matching `.meta` file together. Verify the affected import, scene, or build for missing references.
