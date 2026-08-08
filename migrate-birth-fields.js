import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  // Add the new columns
  await sql`ALTER TABLE birthdays ADD COLUMN IF NOT EXISTS birth_month INTEGER`;
  await sql`ALTER TABLE birthdays ADD COLUMN IF NOT EXISTS birth_day INTEGER`;
  await sql`ALTER TABLE birthdays ADD COLUMN IF NOT EXISTS birth_year INTEGER`;

  // Backfill from the existing dob column, for any existing rows
  await sql`
    UPDATE birthdays
    SET
      birth_month = EXTRACT(MONTH FROM dob),
      birth_day = EXTRACT(DAY FROM dob),
      birth_year = EXTRACT(YEAR FROM dob)
    WHERE dob IS NOT NULL AND birth_month IS NULL
  `;

  // Now that data is migrated, drop the old column
  await sql`ALTER TABLE birthdays DROP COLUMN IF EXISTS dob`;

  // month/day should always be known; year is genuinely optional
  await sql`ALTER TABLE birthdays ALTER COLUMN birth_month SET NOT NULL`;
  await sql`ALTER TABLE birthdays ALTER COLUMN birth_day SET NOT NULL`;

  console.log("Migration complete: dob split into birth_month, birth_day, birth_year.");
}

migrate();