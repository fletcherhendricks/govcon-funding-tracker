# CLAUDE.md — Defense Contract Finance Tool

## What this is
A multi-user web app for early-stage defense startups to track the finances of awarded government contracts: **funded, incurred, billed, collected**, plus the FAR 52.232-22 Limitation of Funds (LOF) notice at 75% of funding.

Built by Luke Hendricks (SMU Finance BBA, CS minor) as a portfolio project for summer internship applications at small Dallas defense firms. Favor working, demoable features over polish.

**Starting from an empty repo.** Nothing is built yet. Earlier prototypes were deliberately discarded.

## Planned stack
- **Supabase** (Postgres, US East): database, magic-link auth, row-level security (RLS)
- **Finance math in SQL views**, not app code
- **Next.js (TypeScript)** in `web/`, deployed on Vercel from GitHub, calling Supabase directly with the signed-in user's session
- **Supabase CLI** for migrations. Every schema change is a migration file in git.
- **Tests** that run the migrations on a real Postgres (local Supabase or PGlite) and check the math and access rules

## Design decisions
- **No separate API server.** Every query runs as the signed-in user, and Postgres decides what that user can see.
- **One shared workspace.** Members see and edit their own contracts. The admin sees everything plus a per-account rollup. Multi-org can come later.
- **The first sign-up becomes admin.** The last active admin can't be demoted. Deactivated users see nothing. Anonymous visitors get no table access.
- **Views use `security_invoker`,** so one query returns "my contracts" for a member and "all contracts" for an admin.
- **Derived numbers are never stored.** The funded amount is the sum of funding actions, and incurred is computed from cost entries and rates.
- **Billed and collected are real entries** (invoices, payments), not estimates.
- **Deliberately not used:** Redis, WebSockets, message queues, Docker in production, microservices. The scale doesn't need them. The one planned background job is an email when the LOF notice becomes due.

## Data model (target)
- `profiles`: one per user, with email, role (admin/member) and active
- `contracts`: PIID, title, agency, type (CPFF/FFP/T&M), ceiling, period of performance, fee rate, owner
- `funding_actions`: one row per modification
- `cost_entries`: direct costs by month (labor, materials, subcontracts, ODCs)
- `indirect_rates`: company-wide fringe/overhead/G&A, provisional and actual, by effective period (admin-managed)
- `invoices`, `payments`
- `audit_log`: every insert/update/delete with who, when, before and after (written by trigger)
- Views: `cost_entries_loaded`, `contract_summary` (the four numbers, % of funding used, LOF flag, burn rate, months of funding left), `portfolio_by_owner` (admin rollup), `rate_variance` (provisional vs actual)

## Rules
- Run the tests after any schema change. All checks must pass before committing.
- Never edit a migration that's already been applied. Add a new one.
- Never disable or weaken RLS. Every new table gets member/admin policies and an audit trigger.
- Money is Postgres `numeric`, never float. Format it only at display time.
- Add a test for every new access rule or finance calculation.
- Use a dev or local Supabase project, never production data.

## Domain cheat sheet
- **Funded:** money the government has obligated so far (can be less than the ceiling)
- **Incurred:** costs spent, loaded with indirect rates
- **Billed / collected:** invoiced / actually paid
- **LOF notice:** required when costs reach 75% of funding on cost-type contracts
- **Contract types:** CPFF (cost plus fixed fee), FFP (firm fixed price), T&M (labor entered at loaded rates)
- **Rate stack:** fringe on labor → overhead on labor + fringe → G&A on total cost input. Test case: labor $10,000, materials $2,000, rates 30/50/12% → loaded cost **$24,080**
- Each contract is treated as one CLIN, and all entered costs are treated as allowable

## Build order
1. Repo, Supabase project, Next.js scaffold, magic-link login, deploy to Vercel
2. Schema migration, RLS, audit log, views, seed data, tests
3. Portfolio page: totals, contract table sorted by months of funding left, 75% badges, admin rollup
4. Contract detail page: monthly costs, funding mods, invoices, payments, a chart
5. Forms to add a contract, mod, monthly costs, invoice and payment
6. Admin pages: users (role, deactivate, reassign), indirect rates editor, audit log
7. USAspending importer: paste a contract number and the fields fill in
8. README, screenshots, a 60-second demo video, real DFW awards as sample data

## Working with Luke
- He knows Java and OOP from his CS classes and is learning TypeScript/JavaScript. When you write unfamiliar syntax (arrow functions, destructuring, `await`, JSX), briefly explain it, comparing to Java where that helps.
- He wants to understand the backend, not just get code. Explain how each piece connects to what the user sees on the dashboard.
- Teach the 20% of concepts that explain 80% of the topic.
- Propose a short plan before writing code on any multi-file change, and wait for his OK.
- Work one feature per branch, and commit when tests pass.
