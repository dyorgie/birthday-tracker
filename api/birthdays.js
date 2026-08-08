import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(400).json({ error: "Missing x-user-id header" });
  }

  try {
    if (req.method === "GET") {
      const rows = await sql`
        SELECT id, name, birth_month, birth_day, birth_year, notes,
               notify_week, notify_three_day, notify_one_day, notify_day_of
        FROM birthdays
        WHERE user_id = ${userId}
        ORDER BY created_at ASC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { name, month, day, year, notes, frequency } = req.body;

      if (!name || !month || !day) {
        return res.status(400).json({ error: "Name, month, and day are required" });
      }

      if (name.length > 60) {
        return res.status(400).json({ error: "Name must be 60 characters or fewer" });
      }

      if (month < 1 || month > 12 || day < 1 || day > 31) {
        return res.status(400).json({ error: "Invalid month or day" });
      }

      const rows = await sql`
        INSERT INTO birthdays (
          name, birth_month, birth_day, birth_year, notes,
          notify_week, notify_three_day, notify_one_day, notify_day_of, user_id
        )
        VALUES (
          ${name},
          ${month},
          ${day},
          ${year ?? null},
          ${notes ?? null},
          ${frequency?.week ?? false},
          ${frequency?.threeDay ?? false},
          ${frequency?.oneDay ?? false},
          ${frequency?.dayOf ?? false},
          ${userId}
        )
        RETURNING id, name, birth_month, birth_day, birth_year, notes,
                  notify_week, notify_three_day, notify_one_day, notify_day_of
      `;

      return res.status(201).json(rows[0]);
    }

    if (req.method === "PUT") {
      const { id } = req.query;
      const { name, month, day, year, notes, frequency } = req.body;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      if (!name || !month || !day) {
        return res.status(400).json({ error: "Name, month, and day are required" });
      }

      if (name.length > 60) {
        return res.status(400).json({ error: "Name must be 60 characters or fewer" });
      }

      if (month < 1 || month > 12 || day < 1 || day > 31) {
        return res.status(400).json({ error: "Invalid month or day" });
      }

      const rows = await sql`
        UPDATE birthdays
        SET
          name = ${name},
          birth_month = ${month},
          birth_day = ${day},
          birth_year = ${year ?? null},
          notes = ${notes ?? null},
          notify_week = ${frequency?.week ?? false},
          notify_three_day = ${frequency?.threeDay ?? false},
          notify_one_day = ${frequency?.oneDay ?? false},
          notify_day_of = ${frequency?.dayOf ?? false}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id, name, birth_month, birth_day, birth_year, notes,
                  notify_week, notify_three_day, notify_one_day, notify_day_of
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: "Entry not found" });
      }

      return res.status(200).json(rows[0]);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      await sql`DELETE FROM birthdays WHERE id = ${id} AND user_id = ${userId}`;
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}