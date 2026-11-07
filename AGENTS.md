<!-- dkalchenko:skill-routing:start -->
## Skill routing

Skill routing: enabled

Marketplace: `plugin-marketplace`

Use the matching skill from the listed plugin when the task calls for it.

| Plugin | Skill | Use when |
| --- | --- | --- |
| `code-style` | `dkalchenko-dotnet-code-style` | Writing or reviewing C# naming and formatting. |
| `code-architecture` | `dkalchenko-unity-code-architecture` | Designing Unity feature boundaries, layers, or dependency direction. |
| `code-architecture` | `dkalchenko-stale-code-removal` | Identifying dead code after replacing an implementation or removing a caller, or when cleanup is requested. |
| `project-architecture` | `dkalchenko-unity-file-placement` | Choosing where Unity scripts and assets belong or moving them. |
| `project-architecture` | `dkalchenko-unity-file-naming` | Naming or renaming Unity scripts, UI files, scenes, or assets. |
| `project-architecture` | `dkalchenko-unity-assemblies` | Creating, updating, or reviewing Unity assembly definitions and references. |
| `project-architecture` | `dkalchenko-unity-stale-files` | Identifying unused Unity files after replacing or retiring files, or when cleanup is requested. |
| `git-repository` | `dkalchenko-git-branch` | Naming and creating a local branch when requested. |
| `git-repository` | `dkalchenko-git-commit` | Reviewing and committing local changes or suggesting commit messages when requested. |

Synchronize only enabled skills supplied by plugins from this marketplace. Remove confirmed disabled or uninstalled entries. Preserve instructions outside this block.
<!-- dkalchenko:skill-routing:end -->
