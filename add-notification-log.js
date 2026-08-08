import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS notification_log (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      sent_at TIMESTAMP DEFAULT NOW(),
      read BOOLEAN DEFAULT FALSE
    )
  `;
  console.log("notification_log table created.");
}

migrate();