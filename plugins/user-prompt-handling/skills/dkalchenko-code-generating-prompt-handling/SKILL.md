---
name: dkalchenko-code-generating-prompt-handling
description: Confirm and refine the interpretation of a user request to generate, implement, modify, or refactor code, then review the proposed approach for concrete improvements before execution.
---

# Code-generating prompt handling

Use this workflow for requests that will generate or change code. Explain the intended outcome in plain language and preserve the user's constraints throughout the conversation. Questions that only ask for an explanation, or requests to describe or edit this skill's instructions, do not start this confirmation loop by themselves. Follow explicit user directions that supersede this workflow and applicable higher-priority instructions.

## Ask through the host's question interface

Prefer an available question tool that provides selectable options and free-text input, such as `request_user_input_async`. Use mode-restricted question tools only when the current mode supports them. If the host already supplies a free-text field or an automatic Other choice, do not add a duplicate option. If no suitable question interface is available, present the same choices in text and invite a written answer.

Wait for the user's submitted response. A preselected first option, silence, a timeout, or an unanswered question is not confirmation. Read-only inspection needed to understand the request may continue, but do not generate the requested code or make implementation changes while a required answer is pending.

## 1. Confirm the interpretation

1. Read the prompt and relevant conversation context. Inspect applicable project instructions and existing code as needed to understand the request. Identify the desired behavior, scope, constraints, and material assumptions without adding requirements of your own.
2. Briefly explain the current interpretation to the user. State what will change and the expected result, including any assumptions that affect the implementation.
3. Ask whether the interpretation is correct, with these two choices in this order:
   - **Yes**
   - **Correct the interpretation**
   Keep the free-text field available for the user's correction.
4. If the user selects **Yes**, or explicitly replies Yes to the current interpretation without changing its requirements, proceed to the critical review below and then execute the agreed prompt when that review is resolved.
5. If the user selects **Correct the interpretation** or provides a correction in free text, incorporate it and regenerate the explanation of the complete request. Preserve earlier corrections and unchanged requirements. Present the same **Yes** / **Correct the interpretation** choices again.
6. If the user selects the correction option without supplying details, ask what needs correcting and wait. Do not invent a correction. A reply that both agrees and changes requirements still needs an updated interpretation and confirmation.
7. Repeat this loop until the user explicitly chooses **Yes** for the latest interpretation. If the user cancels, stop; do not treat cancellation as confirmation.

Keep the confirmed interpretation as the basis for the implementation. Do not ask the user to reconfirm it on every tool call or routine implementation step.

## 2. Critically review the planned code

Before generating or changing code, evaluate whether the confirmed approach has a concrete problem or a useful alternative. Consider:

- Security gaps, such as missing authorization, unsafe handling of input, or exposure of secrets.
- Overengineering, such as abstractions, dependencies, or layers that do not serve the requested behavior.
- Opportunities to simplify duplicated logic, unnecessary state, or an overly complicated implementation.
- Alternative approaches that improve correctness, maintainability, performance, or compatibility for this request.

Ground concerns in the prompt and available project evidence. Distinguish a demonstrated problem from an assumption. Do not invent an objection, expand the scope, or present a generic checklist just to create another approval step. If there is no concrete correction to recommend, execute the confirmed prompt.

When a correction is warranted, explain the concern, its practical effect, the proposed change, and any relevant tradeoff. Make the proposal concrete enough for the user to choose. Group related corrections into one clear proposal; do not silently include unrelated changes.

Present these choices in this order, with a free-text input field alongside them:

- **Accept correction**
- **Proceed with user's prompt**

Handle the response as follows:

| Response | Action |
| --- | --- |
| Accept correction | Apply the described correction to the confirmed approach and execute it. Acceptance authorizes that specific proposal; do not ask for the same approval again. |
| Proceed with user's prompt | Execute the previously confirmed prompt without the proposed correction. Preserve the user's choice; do not repeatedly present the rejected correction unless materially new evidence appears. |
| Custom text that changes or clarifies the request | Incorporate the answer, return to the interpretation loop with a revised explanation, and obtain Yes for the updated request. Then review the revised approach before execution. |
| Custom text that unambiguously accepts one of the displayed choices | Handle it as that choice. |
| Missing or ambiguous answer | Ask for the missing decision and wait; do not select an option for the user. |

Accepting a correction or proceeding with the original prompt does not override higher-priority safety requirements or required permissions. If either prevents execution, explain the specific constraint and offer a permissible alternative.

## Execute the resolved request

Once the interpretation is confirmed and any proposed correction is resolved, carry out the agreed work. Keep the confirmed scope and decisions throughout implementation. If new information materially changes the intended behavior or scope, explain the change and return to the relevant decision step; routine implementation details do not restart the loop.

In the final answer, describe the result, relevant validation, and any remaining limitations. Mention accepted corrections when they explain the resulting behavior.
