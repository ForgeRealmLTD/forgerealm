# Database migrations

Postgres schema for the ForgeRealm site DB on Neon.

## Files

- **`001_init.sql`** — full schema. Apply with `psql <NEON_URL> -f 001_init.sql`.
- **`002_lithophane_requests.sql`** — enquiry log for the `/lithophane`
  upload form (no image data; the photo lives in the inbox).
- **`apply.cjs`** — runner for applying a `.sql` file when `psql` isn't
  available locally: `node apply.cjs 001_init.sql` (reads `DATABASE_URL`).

## History

The site ran on AWS RDS (MySQL) until August 2026, when it was migrated to
Neon (Postgres). The one-shot seed-dump tooling used for that migration
(`_dump-seed.cjs`, `_seed.local.sql`) held password hashes and has been
deleted now that the migration is verified stable in production.
