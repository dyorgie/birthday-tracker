import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function check() {
  const rows = await sql`SELECT user_id, created_at FROM subscriptions`;
  console.log(rows);
}

check();