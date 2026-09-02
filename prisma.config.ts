import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // CLI commands (migrate, db push, ...) need a direct/session connection —
    // PgBouncer transaction-mode pooling doesn't support the DDL advisory locks Migrate uses.
    url: env("DIRECT_URL"),
  },
});
