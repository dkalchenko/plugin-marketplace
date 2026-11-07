---
name: dkalchenko-unity-code-architecture
description: Design and review Unity C# feature boundaries, logical layers, and dependency direction when adding systems or splitting responsibilities.
---

# Unity code architecture

## Feature ownership

- Assign behavior and mutable state to the feature that controls their lifecycle. Keep its rules, presentation, configuration, and runtime Unity integration together.
- Tests retain their feature's logical ownership but live under `Assets/_Game/Tests/`, mirroring the source path relative to `_Game/` and using `<SourceName>Tests.cs`. This includes Editor-dependent tests, which need Editor-only test assemblies.
- Trace callers and serialized dependencies before extracting shared code. Promote a responsibility to a named shared system when multiple features use it.
- Expose cross-feature behavior through a typed reference, a small contract, or an event. Keep view internals private to their owner. Check for dependency cycles and scene initialization order.

## Layers within a feature

| Responsibility | Rule |
| --- | --- |
| Rules and state | Keep calculations, transitions, and invariants independent of views, storage, and scene lifecycle. |
| Application flow | Coordinate user actions, apply rules, and pass results to presentation. |
| Presentation | Bind input and render state. Send user intent to the coordinator. |
| Unity integration | Wire serialized dependencies and lifecycle callbacks at the Unity entry point. Extract persistence or external API access when a change needs an independent boundary. |
| Authored data | Use configuration assets for authored values. Give mutable session state its own owner. |
| Editor tooling | Keep authoring tools outside player dependencies. |

Introduce a folder, interface, or assembly boundary when it serves a specific dependency, compilation, or testing need. A small MonoBehaviour can wire a feature directly. Before isolating rules in an assembly, inspect their transitive model types, attributes, and base classes for Unity dependencies.

## Changes to boundaries

- Map the dependency direction before introducing an assembly definition. Keep Editor code in an Editor-only assembly if a parent assembly would otherwise include it. Resolve dependencies on predefined assemblies before moving their callers into a new assembly.
- Move one responsibility at a time. Preserve serialized field and type identities, persistent events, save formats, asset GUIDs, and scene wiring. Assign ownership of subscriptions and cleanup when moving callbacks.
- Keep the test mirror and assembly references aligned when production code moves.
- In a review, identify the caller, owner, and concrete reason for a split. After a change, verify compilation and the affected behavior, including scene bindings or persistence where applicable.
