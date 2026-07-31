import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  await sql`
    CREATE TABLE IF NOT EXISTS birthdays (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      dob DATE NOT NULL,
      notify_week BOOLEAN DEFAULT FALSE,
      notify_three_day BOOLEAN DEFAULT FALSE,
      notify_one_day BOOLEAN DEFAULT FALSE,
      notify_day_of BOOLEAN DEFAULT FALSE,
      push_subscription JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log("Table created successfully.");
}

setup();