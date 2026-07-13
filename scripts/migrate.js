import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const cs = process.env.DATABASE_URL;
if (!cs) {
  console.error("DATABASE_URL env var required");
  console.log("Run the migration manually in the Supabase Dashboard SQL Editor:");
  console.log("  supabase/migration.sql");
  process.exit(1);
}

async function migrate() {
  const sql = readFileSync(join(__dirname, "..", "supabase", "migration.sql"), "utf8");
  const client = new pg.Client({ connectionString: cs, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    await client.query(sql);
    console.log("Migration applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
