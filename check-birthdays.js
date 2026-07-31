import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function check() {
  const rows = await sql`SELECT id, name, dob FROM birthdays ORDER BY created_at DESC LIMIT 5`;
  console.log(rows);
}

check();