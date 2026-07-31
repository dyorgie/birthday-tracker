import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const rows = await sql`
        SELECT id, name, dob, notify_week, notify_three_day, notify_one_day, notify_day_of
        FROM birthdays
        ORDER BY created_at ASC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { name, dob, frequency } = req.body;

      if (!name || !dob) {
        return res.status(400).json({ error: "Name and dob are required" });
      }

      const rows = await sql`
        INSERT INTO birthdays (name, dob, notify_week, notify_three_day, notify_one_day, notify_day_of)
        VALUES (
          ${name},
          ${dob},
          ${frequency?.week ?? false},
          ${frequency?.threeDay ?? false},
          ${frequency?.oneDay ?? false},
          ${frequency?.dayOf ?? false}
        )
        RETURNING id, name, dob, notify_week, notify_three_day, notify_one_day, notify_day_of
      `;

      return res.status(201).json(rows[0]);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      await sql`DELETE FROM birthdays WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}