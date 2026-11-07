---
name: dkalchenko-stale-code-removal
description: Identify and remove dead code when a change replaces an implementation, removes a caller, or the user asks for a stale-code cleanup.
---

# Stale code removal

Check symbols that lose consumers after a code path is removed or replaced: private helpers, fields, and types. Follow their dependencies within the affected feature; reserve a project-wide cleanup for an explicit request. This skill covers code reachability, not a general asset cleanup.

Search project-wide for references, including tests, tooling, and supported build configurations. Check how the project invokes code indirectly. In Unity, a scene or prefab can reference a script by its `.meta` GUID, a serialized UnityEvent can name a method, and the engine calls lifecycle methods such as `OnEnable`. Preserve public contracts used by external callers.

Retain code when a concrete consumer, external contract, or known planned use remains unresolved. Name the symbol and the missing evidence; ask for a decision only if it is needed to finish the requested cleanup. Do not ask about hypothetical future uses of otherwise confirmed dead code.

Remove confirmed dead code and dependencies made redundant by its removal. Deleting an entire Unity script also requires checking asset references and removing its matching `.meta` file. Build and run relevant existing checks, including affected scene or runtime bindings.
