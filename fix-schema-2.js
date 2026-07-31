import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function fixSchema() {
  // Scope each birthday entry to an anonymous visitor
  await sql`ALTER TABLE birthdays ADD COLUMN IF NOT EXISTS user_id TEXT`;

  // Drop the old generic subscriptions table from the last migration
  await sql`DROP TABLE IF EXISTS subscriptions`;

  // Recreate it, scoped to one subscription per anonymous visitor
  await sql`
    CREATE TABLE subscriptions (
      user_id TEXT PRIMARY KEY,
      subscription JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log("Schema updated for per-user scoping.");
}

fixSchema();