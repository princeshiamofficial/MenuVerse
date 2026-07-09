# Project Rules & Best Practices

## Next.js Caching & Dynamic Routes
- **Force Dynamic API Routes**: Always export `export const dynamic = 'force-dynamic';` at the top of API routes querying database data.
- **Client Cache Bypass**: For client-side `fetch` queries requesting real-time database details, always use `{ cache: 'no-store' }` to bypass Next.js Router and Client caches.

## TypeScript and ESLint Compliance
- **Avoid Explicit `any` Types**: Never use `any` as a type or array declaration. Cast database queries to `Record<string, unknown>[]` or defined interfaces, mapping properties with proper type assertions (e.g., `item.name as string`).
- **Unused Variables**:
  - In `catch` blocks, if the error variable is not referenced, omit it entirely: `catch { ... }`.
  - Avoid importing modules or declaring variables that are not used.
- **CommonJS Scripts (Direct Node Execution)**: For scripts inside the `scripts/` folder (such as seed and clear-cache scripts) that use CommonJS `require()`, always add `/* eslint-disable @typescript-eslint/no-require-imports */` at the top to satisfy linter rules without breaking CommonJS execution.

## CSS and HTML Rules
- **Image Optimization**: Always import and use `<Image />` from `"next/image"` with explicit `width` and `height` dimensions instead of standard HTML `<img>` elements.
- **Tailwind v4 Classes**: Prefer Tailwind v4 canonical styling, such as `bg-linear-to-br` instead of `bg-gradient-to-br`, and `shrink-0` instead of `flex-shrink-0`.
