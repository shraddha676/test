# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Authentication

Email/phone + password auth using Node.js `crypto.scrypt` (no bcrypt).

- **Register**: `POST /api/auth/register` — `{ identifier, password, firstName?, lastName? }`
- **Login**: `POST /api/auth/login` — `{ identifier, password }`
- **Logout**: `POST /api/auth/logout`
- **Current user**: `GET /api/auth/user` — returns `{ user, isAuthenticated }`

Sessions stored in the DB (`sessionsTable`). Passwords hashed with scrypt (salt stored as hex prefix). `identifier` can be an email address or a phone number.

DB schema: `lib/db/src/schema/auth.ts` — includes `phone` and `passwordHash` columns in `usersTable`.
