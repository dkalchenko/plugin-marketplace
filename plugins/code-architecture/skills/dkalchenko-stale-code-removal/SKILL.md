---
name: dkalchenko-stale-code-removal
description: Identify and remove dead code when a change replaces an implementation, removes a caller, or the user asks for a stale-code cleanup.
---

# Stale code removal

Before finishing a change that removes or replaces a code path, check what it used to call. Follow that chain through private helpers, fields, and types that may have lost their last consumer. Keep the cleanup within the affected feature unless the user requests a wider sweep.

Search project-wide for references, including tests, tooling, and supported build configurations. Check how the project invokes code indirectly. In Unity, a scene or prefab can reference a script by its `.meta` GUID, a serialized UnityEvent can name a method, and the engine calls lifecycle methods such as `OnEnable`. Preserve public contracts used by external callers.

If current or planned use is unclear, ask the user whether to keep or delete the code. Name the symbol, summarize what you checked, and explain the uncertainty. Keep it in place until the user confirms deletion.

Remove confirmed dead code and any dependencies made redundant by its removal. Build and run the relevant existing checks, including the affected scene or runtime path when bindings are involved.
