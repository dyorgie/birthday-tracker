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
        SELECT id, name, dob::text, notify_week, notify_three_day, notify_one_day, notify_day_of
        FROM birthdays
        WHERE user_id = ${userId}
        ORDER BY created_at ASC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { name, dob, frequency } = req.body;

      if (!name || !dob) {
        return res.status(400).json({ error: "Name and dob are required" });
      }

      if (name.length > 60) {
        return res.status(400).json({ error: "Name must be 60 characters or fewer" });
      }

      const rows = await sql`
        INSERT INTO birthdays (name, dob, notify_week, notify_three_day, notify_one_day, notify_day_of, user_id)
        VALUES (
          ${name},
          ${dob},
          ${frequency?.week ?? false},
          ${frequency?.threeDay ?? false},
          ${frequency?.oneDay ?? false},
          ${frequency?.dayOf ?? false},
          ${userId}
        )
        RETURNING id, name, dob::text, notify_week, notify_three_day, notify_one_day, notify_day_of
      `;

      return res.status(201).json(rows[0]);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      // WHERE clause includes user_id so you can only delete your own entries
      await sql`DELETE FROM birthdays WHERE id = ${id} AND user_id = ${userId}`;
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}