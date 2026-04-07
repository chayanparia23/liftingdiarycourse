# UI Coding Standards

## Component Library

**All UI must be built exclusively with [shadcn/ui](https://ui.shadcn.com) components.**

- Do **not** create custom UI components. If a shadcn/ui component exists for the use case, use it.
- Do **not** use any other component library (e.g. Base UI, Radix primitives directly, Headless UI).
- If a required component is not yet installed, add it via the shadcn CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- Installed components live in `src/components/ui/` and must not be modified unless absolutely necessary to fix a shadcn bug. Customise appearance via Tailwind classes at the call site, or via CSS variables in `globals.css`.

## Date Formatting

All date formatting must use **[date-fns](https://date-fns.org)**.

Dates visible to the user must follow this format: **ordinal day · abbreviated month · full year**

| Output example  | date-fns format string |
|-----------------|------------------------|
| 1st Sep 2025    | `do MMM yyyy`          |
| 2nd Aug 2025    | `do MMM yyyy`          |
| 3rd Jan 2026    | `do MMM yyyy`          |
| 4th Jun 2024    | `do MMM yyyy`          |

```ts
import { format } from 'date-fns';

format(date, 'do MMM yyyy'); // → "1st Sep 2025"
```

Never use `Date.prototype.toLocaleDateString`, `Intl.DateTimeFormat`, or any other formatting approach for user-facing dates.
