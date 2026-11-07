---
name: dkalchenko-code-generating-prompt-handling
description: Confirm coding intent and resolve proposed security or design corrections before generating, modifying, or refactoring code.
---

# Code-generating prompt handling

Apply to requests that will generate or change code. Explanation-only requests and edits to these instructions do not trigger the loop by themselves. Honor explicit user directions that supersede this workflow.

## Question interface

Use a host question tool with selectable options and free-text input, such as `request_user_input_async`. Respect tool mode restrictions and do not duplicate a built-in Other/free-text field. If no suitable UI exists, present the same options in text and accept a written answer.

A required answer must be submitted: preselection, silence, and timeouts are not confirmation. Read-only investigation may continue while waiting; code generation and implementation changes must wait.

## 1. Confirm the interpretation

Summarize the requested behavior, scope, constraints, and material assumptions using the prompt, conversation, and relevant project context. Ask with these options, in order:

1. **Yes**
2. **Correct the interpretation**

Only Yes to the current summary advances to the critical review. An explicit written Yes counts if it changes no requirements.

For a correction, incorporate it with all earlier agreed requirements, restate the complete interpretation, and repeat the same choices until Yes. If the user selects correction without details, request those details first. Agreement combined with changed requirements also needs a revised summary. Cancellation stops the task.

## 2. Review the planned code

Check for concrete security gaps, overengineering, duplicated or unnecessarily complex logic, and better approaches to correctness, maintainability, performance, or compatibility. Base findings on available evidence and identify material assumptions.

If there is no useful correction, execute the confirmed request. Otherwise explain the concern, practical effect, proposed change, and tradeoff. Group related changes into a reviewable proposal without inventing objections or adding unrelated scope.

Offer these choices, in order, with free-text input:

1. **Accept correction**
2. **Proceed with user's prompt**

| Answer | Next action |
| --- | --- |
| Accept correction | Execute the confirmed request with the described correction. Do not ask for that approval again. |
| Proceed with user's prompt | Execute the confirmed request without the correction. Do not repeat a rejected proposal without materially new evidence. |
| Custom changes or clarification | Return to step 1 with the revised interpretation, obtain Yes, then review the updated approach. |
| Unambiguous written selection | Treat it as the corresponding option. |
| Missing or ambiguous decision | Ask for the missing answer and wait. |

Neither choice overrides required permissions or higher-priority safety constraints. Explain any actual blocker and offer a permissible alternative.

Continue with the resolved scope. Reopen the relevant decision only when new evidence materially changes it; routine implementation steps do not restart either loop.
