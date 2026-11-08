# Rules and examples

These are original illustrative fragments, not complete programs. Project rules override these defaults.

| Rule | Avoid in new code | Prefer |
| --- | --- | --- |
| Descriptive names | `int n = 3;` | `int retryCount = 3;` |
| Types and interfaces | `class order`, `interface repository` | `class Order`, `interface IRepository` |
| Members and constants | `get_total()`, `MAX_RETRIES` | `GetTotal()`, `MaxRetries` |
| Actions and events | `UserCreated`, `userCreation` | `OnUserCreationEvent` |
| Test methods | `CalculateTotalTest()`, `ShouldReturnZero()` | `Should_CalculateTotal_ReturnZero_When_CartIsEmpty()` |
| Parameters and locals | `string CustomerName` | `string customerName` |
| Instance fields | `private int count;` | `private int _count;` |
| Static fields | `private static int count;` | `private static int s_count;` |
| Thread-static fields | `[ThreadStatic] private static int count;` | `[ThreadStatic] private static int t_count;` |
| Accessibility and modifier order | `readonly private int _limit;` | `private readonly int _limit;` |
| Keyword types | `Int32 count`, `String name` | `int count`, `string name` |
| Clear inferred type | `var order = LoadOrder();` | `Order order = LoadOrder();` |
| Explicit construction | `Order order = new Order();` | `var order = new Order();` or `Order order = new();` |
| Interpolation | `"Order: " + orderId` | `$"Order: {orderId}"` |
| Symbol references | `new ArgumentException("Invalid", "orderId")` | `new ArgumentException("Invalid", nameof(orderId))` |

The explicit construction row shows equivalent permitted alternatives, not a requirement to rewrite explicit declarations. Use `readonly` only when reassignment is unnecessary; preserve framework and serialization requirements.

Formatting and braces (the always-braced choice is this skill's adaptation):

```csharp
// Before
if(isReady){Save(orderId);}

// After
if (isReady)
{
    Save(orderId);
}
```

Imports and namespaces (file-scoped namespaces require C# 10; keep block namespaces where the project uses them):

```csharp
using System;
using System.Collections.Generic;
using Contoso.Orders;

namespace Contoso.Checkout;
```

Comments should preserve a reason that would otherwise be lost:

```csharp
// Before: Increase the attempt count.
// After: Count failed attempts too, so the retry limit remains bounded.
attemptCount++;
```

## Blank lines and grouping

Separate methods, independent control-flow statements, logical code blocks within methods, and groups of related fields or properties with one blank line. Group fields and properties by purpose; keep declarations within a group adjacent. Treat a connected `if`/`else if`/`else` chain as one statement: `else if` and `else` go on the line immediately after the preceding closing brace, with no intervening blank line. For example:

```csharp
private string _firstName;
private string _lastName;

private int _retryCount;
private int _retryLimit;

public string DisplayName { get; private set; }
public string Email { get; private set; }

public bool IsActive { get; private set; }
public bool IsVerified { get; private set; }

public void Refresh()
{
    User user = LoadUser();
    Validate(user);

    if (user.IsActive)
    {
        DisplayName = user.DisplayName;
        Email = user.Email;
    }
    else
    {
        Clear();
    }
}

public void Clear()
{
    DisplayName = string.Empty;
    Email = string.Empty;
}
```

Separate distinct `switch` sections with one blank line; keep consecutive `case` labels that share a body together:

```csharp
switch (status)
{
    case Status.Ready:
        Refresh();
        break;

    case Status.Stopped:
        Clear();
        break;
}
```

Use spacing to show changes in purpose rather than separating every statement. Do not stack multiple blank lines or add padding immediately inside braces. These spacing choices are deliberate skill preferences; explicit project conventions still take precedence.

## Conditional expressions

Do not nest one ternary conditional expression (`?:`) inside another, even when split across lines. Move the outer decision into `if`/`else`; a single non-nested ternary inside a branch is allowed. Preserve evaluation order and evaluate only the selected branch.

Avoid:

```csharp
string author = _message.SenderId == _chatInfo.Sender.Id
    ? _chatInfo.Sender.DisplayName
    : _message.SenderId == _chatInfo.Receiver.Id
        ? _chatInfo.Receiver.DisplayName
        : _message.SenderId;
```

Prefer:

```csharp
string author;

if (_message.SenderId == _chatInfo.Sender.Id)
{
    author = _chatInfo.Sender.DisplayName;
}
else
{
    author = _message.SenderId == _chatInfo.Receiver.Id
        ? _chatInfo.Receiver.DisplayName
        : _message.SenderId;
}
```

## Action and event naming

Use `On{Condition}Event` for action delegate members (including `Action` and `Action<T>`) and C# events. `Condition` describes what triggers the notification, in PascalCase; keep `On` and `Event` literal. For example:

```csharp
public Action OnUserCreationEvent;
public event Action OnUserDeletionEvent;
```

This is a deliberate skill preference, not a Microsoft naming rule. It overrides the general field-prefix defaults for action delegate members. Handler and event-raising methods keep the ordinary method naming convention; explicit project conventions still take precedence.

## Test naming

Use `Should_{class/method}_{what to do}_{when}_{condition}`, written as `Should_{ClassOrMethod}_{ExpectedBehavior}_When_{Condition}` in C# test method names:

- `ClassOrMethod`: the class or method under test; choose the one that best identifies the tested behavior.
- `ExpectedBehavior`: what it should do or return.
- `When`: the literal condition separator.
- `Condition`: the circumstances that produce the expected behavior.

Keep `Should` literal. Use PascalCase inside each descriptive segment and underscores between segments. For example:

```csharp
Should_CalculateTotal_ReturnZero_When_CartIsEmpty()
Should_OrderService_RejectOrder_When_PaymentFails()
```

This test-method convention is a deliberate skill preference, not a Microsoft naming rule. It is an exception to the general PascalCase method baseline; explicit project conventions still take precedence.

## Source and adaptation notes

- [Microsoft Learn: common C# conventions](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions) provides the basis for clear type inference, keyword types, interpolation, and comments. Its documentation examples adopt newer language features faster than many applications; this skill keeps the project's compatibility constraints.
- [Microsoft Learn: identifier naming](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/identifier-names) provides the naming baseline. Runtime-style field prefixes are conventions, not compiler requirements.
- [.NET runtime C# style](https://github.com/dotnet/runtime/blob/main/docs/coding-guidelines/coding-style.md) informs layout, imports, accessibility, and respecting surrounding code. This skill does not import runtime-specific performance or inheritance policies. It chooses braces consistently and permits clear inferred types rather than adopting the runtime's narrower `var` policy.

Sources checked on 2026-11-06. These are selected defaults, not an exhaustive copy of any source or a mandate to migrate existing projects.
