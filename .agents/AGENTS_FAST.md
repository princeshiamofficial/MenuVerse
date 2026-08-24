# AGENTS_FAST.md

## Purpose

This file optimizes AI coding agents for fast, focused implementation.

Follow the main `AGENTS.md` for architecture, security, MySQL, UI/UX, and quality requirements.

Use this file to avoid:

- Excessive project exploration
- Repeated file searching
- Re-reading the same files
- Over-analysis
- Unnecessary planning
- Long explanations
- Unrequested documentation
- Rebuilding working code
- Stopping for minor questions

The goal is to produce correct working code quickly without sacrificing essential security or data integrity.

---

# Operating Mode

Work in implementation-first mode.

Use this priority:

1. Understand the request.
2. Inspect only the files needed.
3. Identify the smallest safe change.
4. Implement the change.
5. Verify affected functionality.
6. Report the result briefly.

Do not spend excessive time describing what you are going to do.

Do the work.

---

# Fast Start Rule

Before coding, inspect only:

- `package.json`
- Main project structure
- Relevant feature folder
- Existing database connection
- Existing schema or migrations
- Relevant API or server action
- Relevant page and components
- Shared conventions directly used by the feature

Do not scan the entire repository unless the requested change genuinely affects the entire application.

---

# Search Budget

Use targeted searches.

Prefer searching for:

- Exact component name
- Exact route
- Exact table name
- Exact function name
- Exact field name
- Exact error message
- Exact API endpoint

Avoid broad searches such as:

```text
Search the whole project for anything related to users.
```

Prefer:

```text
Find the users table schema.
Find the POST /api/users handler.
Find the user creation form.
Find the repository function that inserts users.
```

Do not repeat the same search unless the project changed or the first result was incomplete.

---

# File Reading Rules

Read the smallest useful section of a file.

Do not repeatedly read complete large files when only one function is relevant.

After finding the target code:

1. Read its imports.
2. Read the relevant function or component.
3. Read directly related helpers.
4. Make the change.

Only inspect additional files when required to avoid breaking existing behavior.

---

# Analysis Limit

Do not produce long internal plans for ordinary CRUD, UI, database, validation, or bug-fix tasks.

For standard tasks, identify only:

- Files to modify
- Database impact
- API impact
- UI impact
- Main security or data risk

Then begin implementation.

Do not generate multiple alternative architectures unless the current architecture cannot support the requirement.

---

# Decision Rule

When several valid approaches exist:

1. Follow the existing project pattern.
2. Reuse the installed libraries.
3. Select the simplest maintainable solution.
4. Avoid adding new dependencies.
5. Continue implementation.

Do not stop to ask which library or coding style to use when the repository already provides an answer.

---

# Clarification Rule

Do not ask questions for minor missing details.

Use safe, conventional defaults for:

- Component naming
- File naming
- Pagination defaults
- Button placement
- Empty-state wording
- Loading indicators
- Basic validation messages
- Common responsive behavior
- Internal helper structure

Ask a question only when the missing information could materially change:

- Permissions
- Financial calculations
- Data ownership
- Destructive behavior
- Legal or compliance behavior
- Core workflow
- External service credentials
- Irreversible database changes

When possible, use a clearly documented assumption and continue.

---

# Existing Code First

Before creating a new file, check whether the project already contains:

- A reusable component
- A database helper
- A repository
- A validation schema
- A service
- An API response helper
- A dialog
- A table
- A form pattern
- A permission checker
- A date or currency formatter

Reuse existing code when it is suitable.

Do not create duplicate utilities with different names.

---

# Minimal Change Principle

Modify the smallest number of files necessary to complete the feature safely.

Do not:

- Rewrite entire modules for a small feature
- Move unrelated files
- Rename unrelated components
- Reformat the whole repository
- Replace existing libraries
- Change project architecture without necessity
- Modify unrelated business logic
- Add speculative features

Preserve working behavior.

---

# No Premature Refactoring

Fix or implement the requested feature first.

Refactor only when:

- Existing code prevents correct implementation
- There is a clear security problem
- There is a database connection leak
- Logic duplication directly affects the feature
- Type or build errors require it
- The user explicitly requests refactoring

Do not turn a small task into a repository-wide cleanup.

---

# Database Efficiency

For database work:

1. Inspect the current schema.
2. Check whether the required table or column exists.
3. Create only the necessary migration.
4. Add only useful indexes.
5. Update only affected queries.
6. Verify foreign-key relationships.
7. Use parameterized queries.
8. Use transactions only when multiple writes must succeed together.

Do not redesign the whole database for a single new field.

Do not create duplicate tables when an existing table can safely support the feature.

---

# MySQL Connection Rule

Reuse the existing MySQL pool or ORM client.

Never:

- Create a database connection inside every request
- Create multiple connection helper files
- Introduce a second ORM without necessity
- Connect to MySQL from browser code
- Expose database credentials
- Run unlimited queries in loops

For bulk operations, prefer batch queries instead of one query per row.

Avoid N+1 queries.

---

# Query Optimization Rule

Optimize queries only when needed.

Always ensure:

- Results are limited or paginated
- Filtered columns have useful indexes when appropriate
- Joins use indexed keys
- User input is parameterized
- Sorting fields use an allowlist
- Large lists are not loaded entirely into memory

Do not spend time micro-optimizing small queries without evidence of a performance issue.

Use `EXPLAIN` for queries that are actually slow, complex, or operating on large tables.

---

# UI Generation Mode

For UI tasks, first inspect:

- Existing layout
- Existing design tokens
- Existing button styles
- Existing form components
- Existing cards and tables
- Existing mobile behavior

Then build the page using the current design system.

Do not research unrelated UI inspirations unless the user explicitly requests a new visual direction.

Do not create multiple design concepts unless requested.

Create one polished, consistent implementation.

---

# UI/UX Defaults

Use these defaults unless the project specifies otherwise:

- Clear page title
- Short supporting description
- Primary action in the top-right on desktop
- Responsive stacked controls on mobile
- Visible labels for form fields
- Inline validation
- Loading state
- Empty state
- Error state
- Success feedback
- Confirmation for destructive actions
- Accessible keyboard interactions
- Consistent spacing and typography

Avoid unnecessary animations and decorative effects.

---

# CRUD Fast Path

For a standard CRUD feature, implement in this order:

1. Database migration
2. Type definitions
3. Validation schema
4. Repository or query functions
5. Service or business rules
6. API or server action
7. List page
8. Create form
9. Edit form
10. Delete or archive action
11. Loading, error, and empty states
12. Basic verification

Do not spend time creating extensive planning documents before starting.

---

# Bug-Fix Fast Path

For a bug:

1. Locate the failing path.
2. Read the relevant code.
3. Identify the root cause.
4. Apply the smallest correct fix.
5. Check nearby edge cases.
6. Run the most relevant verification.
7. Report the root cause and fix briefly.

Do not rewrite surrounding code unless required.

Do not hide symptoms with arbitrary delays, retries, or broad `try/catch` blocks.

---

# Error Investigation Limit

When investigating an error:

- Start from the exact error message.
- Check the exact file and line.
- Trace only direct callers.
- Check relevant environment variables.
- Check relevant database schema.
- Reproduce using the smallest relevant command.

Do not inspect unrelated modules.

After identifying a likely root cause, implement and verify the fix instead of continuing endless investigation.

---

# Dependency Rule

Do not install a package when the project already has a suitable solution.

Before installing anything, check:

- Existing dependencies
- Existing utility functions
- Native platform APIs
- Framework-provided features

Install a new dependency only when it significantly reduces risk or complexity.

Never add multiple libraries that solve the same problem.

---

# Documentation Limit

Update documentation only when the change affects:

- Setup
- Environment variables
- Migration commands
- Public API usage
- Deployment
- Important business rules

Do not generate long documentation for small internal changes.

Keep comments focused on why the code exists, not what obvious code does.

---

# Testing Strategy

Run the narrowest useful checks first.

Recommended order:

1. Test the affected function or route.
2. Run targeted TypeScript checking if supported.
3. Run lint on affected files if supported.
4. Run relevant tests.
5. Run the full build when the change affects production compilation.

Do not repeatedly run the full build after every small edit.

Run the full build after the implementation is stable.

Never claim a command passed unless it was actually executed successfully.

---

# Tool Call Efficiency

Batch related operations when possible.

Examples:

- Search multiple exact symbols together.
- Read related file sections together.
- Apply related edits in one pass.
- Run related verification commands together.

Avoid switching repeatedly between searching, planning, and editing.

Once sufficient context is available, implement.

---

# Avoid Analysis Loops

Do not continue analysis after all of these are known:

- Target file
- Existing pattern
- Required data flow
- Required database change
- Required validation
- Required permission

At that point, begin implementation.

Do not repeatedly reconsider already settled decisions without new evidence.

---

# Stop Conditions

Stop exploring and start coding when:

- The relevant page is found
- The backend handler is found
- The database layer is found
- The expected behavior is understood
- No major permission or data ambiguity remains

Stop adding changes when the user's requested workflow works correctly.

Do not add “nice-to-have” features without being asked.

---

# Completion Definition

A task is complete when:

- Requested behavior is implemented
- Real database or API integration works
- Essential validation exists
- Essential authorization exists
- Loading and error handling exist
- Relevant checks pass
- No known critical issue remains

It does not require unrelated cleanup or perfection across the entire repository.

---

# Compact Final Response

After implementation, respond using this structure:

## Done

Briefly state what was implemented.

## Changed

List the main files or modules changed.

## Database

Mention migrations or schema changes, if any.

## Verified

List only commands actually run and their results.

## Note

Mention only important assumptions, remaining configuration, or unverified items.

Keep the final response focused.

Do not provide a long tutorial unless requested.

---

# Direct Execution Instruction

When receiving a task:

- Read `AGENTS.md`.
- Read `AGENTS_FAST.md`.
- Follow existing project conventions.
- Inspect only relevant files.
- Avoid repeated searches.
- Avoid excessive analysis.
- Make the smallest safe implementation.
- Connect UI, backend, and MySQL completely.
- Verify the affected workflow.
- Report results concisely.

Do not stop after creating a mock UI.

Do not waste time exploring unrelated code.

Do not ask unnecessary questions.

Implement the requested feature directly.
