import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  await sql`ALTER TABLE birthdays ADD COLUMN IF NOT EXISTS notes TEXT`;
  console.log("notes column added.");
}

migrate();